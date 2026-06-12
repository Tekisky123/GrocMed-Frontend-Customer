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
            const url = `${axiosInstance.defaults.baseURL}/customer/register`;
            console.log(`[customerApi.register] Sending POST request to: ${url}`);
            console.log(`[customerApi.register] Payload type: ${data?.constructor?.name || typeof data}`);
            
            // Log FormData keys if parts are visible
            if (data && data._parts) {
                console.log(`[customerApi.register] FormData keys being sent:`, data._parts.map((p: any) => p[0]));
            }

            // Use standard fetch to bypass Axios FormData serialization issues on React Native/Hermes
            const response = await fetch(url, {
                method: 'POST',
                body: data,
                // Let the native layer set multipart/form-data with the boundary automatically
            });

            console.log(`[customerApi.register] Response status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log(`[customerApi.register] Response body text:`, text);

            try {
                const parsed = JSON.parse(text);
                console.log(`[customerApi.register] Parsed JSON response:`, parsed);
                return parsed;
            } catch (jsonError) {
                console.error(`[customerApi.register] JSON parse error:`, jsonError);
                return {
                    success: false,
                    token: '',
                    message: `Invalid server response: ${text.substring(0, 100)}`
                };
            }
        } catch (error: any) {
            console.error(`[customerApi.register] Fetch exception:`, error);
            return {
                success: false,
                token: '',
                message: error.message || 'Registration failed',
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
    
    getNotifications: async (page = 1, limit = 20): Promise<{ success: boolean; notifications: any[]; total?: number; message?: string }> => {
        try {
            const response = await axiosInstance.get(`/customer/notifications?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                notifications: [],
                message: error.response?.data?.message || 'Failed to fetch notifications',
            };
        }
    },
};
