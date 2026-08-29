import axiosInstance from './axiosInstance';

export interface DayTiming {
    isClosed: boolean;
    openTime: string;
    closeTime: string;
}

export interface StoreStatus {
    isOpen: boolean;
    isEmergencyClosed: boolean;
    closureReason?: string | null;
    statusMessage: string;
    currentDay: string;
    nextOpenTime?: string | null;
}

export interface SystemSettings {
    minOrderValue: number;
    freeDeliveryThreshold: number;
    deliveryCharge: number;
    maxOrdersPerDay: number;
    maxOrdersPerSlot: number;
    paymentQrUrl?: string | null;
    storeTimings?: {
        isEmergencyClosed: boolean;
        closureReason: string;
        weeklyHours: Record<string, DayTiming>;
    };
    storeStatus?: StoreStatus;
}

export const settingApi = {
    getSettings: async (): Promise<{ success: boolean; data?: SystemSettings; message?: string }> => {
        try {
            const response = await axiosInstance.get('/settings');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch settings',
            };
        }
    },
    getStoreStatus: async (): Promise<{ success: boolean; data?: StoreStatus; message?: string }> => {
        try {
            const response = await axiosInstance.get('/settings/store-status');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch store status',
            };
        }
    }
};
