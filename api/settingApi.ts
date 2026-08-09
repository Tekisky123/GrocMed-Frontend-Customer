import axiosInstance from './axiosInstance';

export interface SystemSettings {
    minOrderValue: number;
    freeDeliveryThreshold: number;
    deliveryCharge: number;
    maxOrdersPerDay: number;
    maxOrdersPerSlot: number;
    paymentQrUrl?: string | null;
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
};
