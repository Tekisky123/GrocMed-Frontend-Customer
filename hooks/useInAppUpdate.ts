import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import {
  inAppUpdateService,
  InAppUpdatePolicy,
  UpdateCheckResult,
  DownloadStatus,
} from '@/services/inAppUpdateService';
import { IAUInstallStatus } from 'sp-react-native-in-app-updates';

export interface UseInAppUpdateOptions {
  autoCheck?: boolean;
  policy?: Partial<InAppUpdatePolicy>;
}

export function useInAppUpdate(options: UseInAppUpdateOptions = { autoCheck: true }) {
  const { autoCheck = true, policy } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Apply policy if provided
  useEffect(() => {
    if (policy) {
      inAppUpdateService.configurePolicy(policy);
    }
  }, [policy]);

  const checkForUpdate = useCallback(async (force = false) => {
    if (Platform.OS !== 'android') return;

    setIsChecking(true);
    setError(null);

    try {
      const result = await inAppUpdateService.checkForUpdate(force);
      setUpdateInfo(result);

      if (result.shouldUpdate && result.updateMode) {
        if (result.updateMode === 'immediate') {
          // For mandatory/immediate updates, trigger native Google Play flow immediately
          await inAppUpdateService.startUpdate('immediate');
        } else if (result.updateMode === 'flexible') {
          // For flexible updates, start download in background
          await inAppUpdateService.startUpdate('flexible');
        }
      }
    } catch (err: any) {
      console.warn('[useInAppUpdate] Error in checkForUpdate:', err);
      setError(err?.message || 'Update check failed');
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Listen to download progress
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const unsubscribe = inAppUpdateService.addDownloadStatusListener((status: DownloadStatus) => {
      setDownloadStatus(status);
      if (status.status === IAUInstallStatus.DOWNLOADED) {
        setIsDownloaded(true);
        setIsDismissed(false); // Make sure banner shows when download is complete
      }
    });

    return unsubscribe;
  }, []);

  // Handle AppState changes (resume interrupted updates when app becomes active)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has returned to the foreground
        await inAppUpdateService.resumePendingUpdate();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Automatic initial check on mount (non-blocking after small delay)
  useEffect(() => {
    if (!autoCheck || Platform.OS !== 'android') return;

    const timer = setTimeout(() => {
      checkForUpdate(false);
    }, 2000); // 2 second delay to avoid impacting startup render

    return () => clearTimeout(timer);
  }, [autoCheck, checkForUpdate]);

  const installUpdate = useCallback(() => {
    inAppUpdateService.installFlexibleUpdate();
  }, []);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  return {
    isChecking,
    updateInfo,
    downloadStatus,
    isDownloaded,
    isDismissed,
    isDownloading:
      downloadStatus?.status === IAUInstallStatus.DOWNLOADING ||
      downloadStatus?.status === IAUInstallStatus.PENDING,
    downloadPercentage: downloadStatus?.percentage ?? 0,
    error,
    checkForUpdate,
    installUpdate,
    dismissBanner,
  };
}
