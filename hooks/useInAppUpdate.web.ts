// Web mock for useInAppUpdate hook

export interface UseInAppUpdateOptions {
  autoCheck?: boolean;
  policy?: any;
}

export function useInAppUpdate(_options: UseInAppUpdateOptions = { autoCheck: true }) {
  return {
    isChecking: false,
    updateInfo: null,
    downloadStatus: null,
    isDownloaded: false,
    isDismissed: true,
    isDownloading: false,
    downloadPercentage: 0,
    error: null,
    checkForUpdate: async () => {},
    installUpdate: () => {},
    dismissBanner: () => {},
  };
}
