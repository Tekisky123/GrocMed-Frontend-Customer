import axiosInstance from './axiosInstance';

export interface PincodeOption {
    _id: string;
    pincode: string;
    deliveryNote?: string;
    isActive: boolean;
    city?: string;
    state?: string;
    area?: string;
}

export const pincodeApi = {
    getActivePincodes: async (): Promise<{ success: boolean; data: PincodeOption[] }> => {
        try {
            const response = await axiosInstance.get('/pincodes/active');
            return response.data;
        } catch (error: any) {
            console.error('Get pincodes error:', error);
            return { success: false, data: [] };
        }
    },
};
