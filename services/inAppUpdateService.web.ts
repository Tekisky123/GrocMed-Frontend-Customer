// Web mock implementation for In-App Updates (Google Play is Android-only)

export interface InAppUpdatePolicy {
  mandatoryPriorityThreshold?: number;
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
  status: number;
  bytesDownloaded: number;
  totalBytesToDownload: number;
  percentage: number;
};

export enum IAUInstallStatus {
  UNKNOWN = 0,
  PENDING = 1,
  DOWNLOADING = 2,
  INSTALLING = 3,
  INSTALLED = 4,
  FAILED = 5,
  CANCELED = 6,
  DOWNLOADED = 11,
}

export enum IAUUpdateKind {
  FLEXIBLE = 0,
  IMMEDIATE = 1,
}

export enum IAUAvailabilityStatus {
  UNKNOWN = 0,
  AVAILABLE = 2,
  UNAVAILABLE = 1,
  DEVELOPER_TRIGGERED = 3,
}

class InAppUpdateServiceWeb {
  public configurePolicy(_newPolicy: Partial<InAppUpdatePolicy>): void {}

  public addDownloadStatusListener(_listener: (status: DownloadStatus) => void): () => void {
    return () => {};
  }

  public async checkForUpdate(_force = false): Promise<UpdateCheckResult> {
    return {
      shouldUpdate: false,
      updateMode: null,
      reason: 'In-app updates are only available on Android',
    };
  }

  public async startUpdate(_mode: 'immediate' | 'flexible'): Promise<boolean> {
    return false;
  }

  public installFlexibleUpdate(): void {}

  public async resumePendingUpdate(): Promise<void> {}

  public getIsDownloaded(): boolean {
    return false;
  }
}

export const inAppUpdateService = new InAppUpdateServiceWeb();
