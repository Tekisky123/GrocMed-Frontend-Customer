import axiosInstance from './axiosInstance';

export interface CustomerAuthResponse {
    success: boolean;
    token: string;
    user?: any; // Define a proper User type later if needed, or use the one from types/index.ts
    message?: string;
}

export interface CustomerProfileResponse {
    success: boolean;
    data: any; // Use User type
    message?: string;
}

export const customerApi = {
    register: async (data: any): Promise<CustomerAuthResponse> => {
        try {
            const response = await axiosInstance.post('/customer/register', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                token: '',
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    },

    login: async (data: any): Promise<CustomerAuthResponse> => {
        try {
            const response = await axiosInstance.post('/customer/login', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                token: '',
                message: error.response?.data?.message || 'Login failed',
            };
        }
    },

    getProfile: async (): Promise<CustomerProfileResponse> => {
        try {
            const response = await axiosInstance.get('/customer/profile');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to fetch profile',
            };
        }
    },

    updateProfile: async (data: any): Promise<CustomerProfileResponse> => {
        try {
            const response = await axiosInstance.put('/customer/profile', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to update profile',
            };
        }
    },

    updateFcmToken: async (fcmToken: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await axiosInstance.post('/customer/update-fcm-token', { fcmToken });
            return { success: true };
        } catch (error: any) {
            console.error('Failed to update FCM token', error);
            // Don't fail the app flow if token sync fails, just log it
            return { success: false, message: 'Failed to sync token' };
        }
    },
};
