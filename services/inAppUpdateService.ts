import { Platform } from 'react-native';
import { getBuildNumber } from 'react-native-device-info';
import SpInAppUpdates, {
  IAUUpdateKind,
  IAUInstallStatus,
  IAUAvailabilityStatus,
  StatusUpdateEvent,
  AndroidNeedsUpdateResponse,
  NeedsUpdateResponse,
} from 'sp-react-native-in-app-updates';

export interface InAppUpdatePolicy {
  /**
   * Google Play Update Priority (0 to 5) at or above which an update is treated as MANDATORY (IMMEDIATE).
   * Default is 4 (Google Play convention: 0=default, 4-5=critical/mandatory).
   */
  mandatoryPriorityThreshold?: number;

  /**
   * Optional custom callback to evaluate if an update is mandatory
   * (e.g. from backend API, minimum supported version, or store version check).
   */
  isMandatory?: (info: {
    versionCode?: number;
    storeVersion?: string;
    priority?: number;
  }) => boolean;
}

export type UpdateCheckResult = {
  shouldUpdate: boolean;
  updateMode: 'immediate' | 'flexible' | null;
  versionCode?: number;
  storeVersion?: string;
  priority?: number;
  reason?: string;
};

export type DownloadStatus = {
  status: IAUInstallStatus;
  bytesDownloaded: number;
  totalBytesToDownload: number;
  percentage: number;
};

class InAppUpdateService {
  private inAppUpdates: SpInAppUpdates | null = null;
  private isChecking = false;
  private isUpdateInProgress = false;
  private isDownloaded = false;
  private statusListeners: Set<(status: DownloadStatus) => void> = new Set();
  private policy: InAppUpdatePolicy = {
    mandatoryPriorityThreshold: 4,
  };
  private lastCheckTimestamp = 0;
  private readonly CHECK_COOLDOWN_MS = 60000; // 1 minute cooldown to prevent duplicate checks

  constructor() {
    if (Platform.OS === 'android') {
      try {
        // false = production mode (true logs debug information)
        this.inAppUpdates = new SpInAppUpdates(__DEV__);
        this.setupStatusListener();
      } catch (err) {
        console.warn('[InAppUpdateService] Failed to initialize SpInAppUpdates:', err);
      }
    }
  }

  /**
   * Configure update policy (can be updated dynamically or on app start)
   */
  public configurePolicy(newPolicy: Partial<InAppUpdatePolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
  }

  /**
   * Register a listener for flexible download progress & status
   */
  public addDownloadStatusListener(listener: (status: DownloadStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(status: DownloadStatus): void {
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('[InAppUpdateService] Status listener error:', err);
      }
    });
  }

  private setupStatusListener(): void {
    if (!this.inAppUpdates || Platform.OS !== 'android') return;

    try {
      this.inAppUpdates.addStatusUpdateListener((event: StatusUpdateEvent) => {
        const total = Number(event.totalBytesToDownload) || 0;
        const downloaded = Number(event.bytesDownloaded) || 0;
        const percentage = total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;

        if (event.status === IAUInstallStatus.DOWNLOADED) {
          this.isDownloaded = true;
          this.isUpdateInProgress = false;
        } else if (
          event.status === IAUInstallStatus.FAILED ||
          event.status === IAUInstallStatus.CANCELED
        ) {
          this.isUpdateInProgress = false;
        }

        this.notifyStatus({
          status: event.status,
          bytesDownloaded: downloaded,
          totalBytesToDownload: total,
          percentage,
        });
      });
    } catch (err) {
      console.warn('[InAppUpdateService] addStatusUpdateListener failed:', err);
    }
  }

  /**
   * Check for Google Play In-App Updates and determine the update mode (Immediate vs Flexible).
   * Safe to call multiple times; debounced and concurrency protected.
   */
  public async checkForUpdate(force = false): Promise<UpdateCheckResult> {
    if (Platform.OS !== 'android' || !this.inAppUpdates) {
      return { shouldUpdate: false, updateMode: null, reason: 'Unsupported platform' };
    }

    const now = Date.now();
    if (!force && this.isChecking) {
      return { shouldUpdate: false, updateMode: null, reason: 'Check already in progress' };
    }
    if (!force && now - this.lastCheckTimestamp < this.CHECK_COOLDOWN_MS) {
      return { shouldUpdate: false, updateMode: null, reason: 'Debounce cooldown active' };
    }

    this.isChecking = true;
    this.lastCheckTimestamp = now;

    try {
      let curVersion: string | undefined;
      try {
        curVersion = getBuildNumber();
      } catch (e) {
        // Fallback gracefully
      }

      const response: NeedsUpdateResponse = await this.inAppUpdates.checkNeedsUpdate({
        curVersion,
        customVersionComparator: (newV, curV) => {
          const newCode = parseInt(`${newV}`, 10);
          const curCode = parseInt(`${curV}`, 10);
          if (!isNaN(newCode) && !isNaN(curCode)) {
            return newCode > curCode ? 1 : newCode < curCode ? -1 : 0;
          }
          return 0;
        },
      });
      
      if (!response || !response.shouldUpdate) {
        return {
          shouldUpdate: false,
          updateMode: null,
          storeVersion: response?.storeVersion,
          reason: response?.reason || 'App is up to date',
        };
      }

      // Android specific update details
      const androidResponse = response as AndroidNeedsUpdateResponse;
      const extras = androidResponse.other;
      const priority = extras?.updatePriority ?? 0;
      const versionCode = extras?.versionCode;
      const storeVersion = androidResponse.storeVersion;

      // Determine if update is Mandatory (Immediate) or Optional (Flexible)
      let isMandatory = false;

      // 1. Check custom policy if provided
      if (typeof this.policy.isMandatory === 'function') {
        isMandatory = this.policy.isMandatory({
          versionCode,
          storeVersion,
          priority,
        });
      }

      // 2. Fallback to priority threshold (Google Play updatePriority 0-5)
      if (!isMandatory) {
        const threshold = this.policy.mandatoryPriorityThreshold ?? 4;
        isMandatory = priority >= threshold;
      }

      // 3. Fallback to Google Play's allowance checks
      let updateMode: 'immediate' | 'flexible' | null = null;
      if (isMandatory) {
        if (extras?.isImmediateUpdateAllowed) {
          updateMode = 'immediate';
        } else if (extras?.isFlexibleUpdateAllowed) {
          // If immediate is disallowed by Google Play, gracefully fall back to flexible
          updateMode = 'flexible';
        }
      } else {
        if (extras?.isFlexibleUpdateAllowed) {
          updateMode = 'flexible';
        } else if (extras?.isImmediateUpdateAllowed) {
          // If flexible is disallowed by Google Play, fall back to immediate
          updateMode = 'immediate';
        }
      }

      return {
        shouldUpdate: updateMode !== null,
        updateMode,
        versionCode,
        storeVersion,
        priority,
      };
    } catch (err: any) {
      // Graceful error handling: Offline, Play Services unavailable, or not installed from Play Store
      console.warn('[InAppUpdateService] checkNeedsUpdate error:', err?.message || err);
      return {
        shouldUpdate: false,
        updateMode: null,
        reason: err?.message || 'Error checking for updates',
      };
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Start the update flow.
   * - IMMEDIATE: Full-screen native Google Play UI.
   * - FLEXIBLE: Background download.
   */
  public async startUpdate(mode: 'immediate' | 'flexible'): Promise<boolean> {
    if (Platform.OS !== 'android' || !this.inAppUpdates) return false;

    if (this.isUpdateInProgress) {
      console.log('[InAppUpdateService] Update already in progress');
      return false;
    }

    try {
      this.isUpdateInProgress = true;
      const updateType =
        mode === 'immediate' ? IAUUpdateKind.IMMEDIATE : IAUUpdateKind.FLEXIBLE;

      await this.inAppUpdates.startUpdate({
        updateType,
      });
      return true;
    } catch (err: any) {
      this.isUpdateInProgress = false;
      console.warn('[InAppUpdateService] startUpdate error:', err?.message || err);
      return false;
    }
  }

  /**
   * Complete the flexible update and restart the app.
   * Must only be called after status reaches IAUInstallStatus.DOWNLOADED.
   */
  public installFlexibleUpdate(): void {
    if (Platform.OS !== 'android' || !this.inAppUpdates) return;

    try {
      this.inAppUpdates.installUpdate();
    } catch (err: any) {
      console.error('[InAppUpdateService] installUpdate error:', err?.message || err);
    }
  }

  /**
   * Check and resume interrupted updates when app returns to foreground.
   * - If an immediate update was in progress and interrupted, restart it.
   * - If a flexible update has already completed downloading, notify listeners.
   */
  public async resumePendingUpdate(): Promise<void> {
    if (Platform.OS !== 'android' || !this.inAppUpdates) return;

    try {
      const response = await this.inAppUpdates.checkNeedsUpdate();
      const androidResp = response as AndroidNeedsUpdateResponse;
      const extras = androidResp?.other;

      if (!extras) return;

      // In Play Core:
      // If immediate update was interrupted, updateAvailability may be DEVELOPER_TRIGGERED
      if (
        extras.updateAvailability === IAUAvailabilityStatus.DEVELOPER_TRIGGERED &&
        extras.isImmediateUpdateAllowed
      ) {
        console.log('[InAppUpdateService] Resuming interrupted immediate update...');
        await this.startUpdate('immediate');
      }
    } catch (err: any) {
      console.warn('[InAppUpdateService] resumePendingUpdate error:', err?.message || err);
    }
  }

  /**
   * Returns whether a flexible update is downloaded and ready to install.
   */
  public getIsDownloaded(): boolean {
    return this.isDownloaded;
  }
}

// Singleton export
export const inAppUpdateService = new InAppUpdateService();
