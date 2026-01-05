import axiosInstance, { tokenManager } from './axiosInstance';

// DeliveryPartner types
export interface DeliveryPartner {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: 'delivery_partner';
    isActive: boolean;
    fcmToken?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        deliveryPartner: DeliveryPartner;
        token: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    count?: number;
}

export interface CreateDeliveryPartnerData {
    name: string;
    email: string;
    password: string;
    role?: 'delivery_partner';
}

export interface UpdateDeliveryPartnerData {
    name?: string;
    email?: string;
    role?: 'delivery_partner';
    isActive?: boolean;
}

// DeliveryPartner API functions
export const deliveryPartnerApi = {
    // Login delivery partner
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            // Keeping endpoint as /admin/loginAdmin as per plan unless backend changed
            // But user said "replace all admin tings to delivery partner", implying full renaming.
            // If I change the URL, it will 404 if backend is not updated.
            // I will assume backend IS updated or will be updated to match /deliveryPartner/...
            // However, usually these refactors come in pairs.
            // Safest bet: logical rename on frontend, keep URLs if backend is legacy, BUT
            // "implement this api in public... and also replace all admin tings... implement properly"
            // suggests a clean slate or full request.
            // I'll take a calculated risk and use /deliveryPartner/ endpoints, but I should probably check if I can.
            // Since I can't check backend, I will conform to the "Replace admin with delivery partner" instruction fully.
            // If it breaks, it's a backend mismatch which is out of my requested scope (frontend).

            const response = await axiosInstance.post<LoginResponse>('/deliveryPartner/loginDeliveryPartner', {
                email,
                password,
            });

            if (response.data.success && response.data.data.token) {
                // Save token and delivery partner data
                await tokenManager.saveToken(response.data.data.token);
                await tokenManager.saveDeliveryPartnerData(response.data.data.deliveryPartner);
            }

            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Login failed. Please try again.'
            );
        }
    },

    // Get all delivery partners
    async getAllDeliveryPartners(): Promise<ApiResponse<DeliveryPartner[]>> {
        try {
            const response = await axiosInstance.get<ApiResponse<DeliveryPartner[]>>(
                '/deliveryPartner/getAllDeliveryPartners'
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to fetch delivery partners.'
            );
        }
    },

    // Get delivery partner by ID
    async getDeliveryPartnerById(id: string): Promise<ApiResponse<DeliveryPartner>> {
        try {
            const response = await axiosInstance.get<ApiResponse<DeliveryPartner>>(
                `/deliveryPartner/getDeliveryPartnerById/${id}`
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to fetch delivery partner.'
            );
        }
    },

    // Create delivery partner
    async createDeliveryPartner(data: CreateDeliveryPartnerData): Promise<ApiResponse<DeliveryPartner>> {
        try {
            const response = await axiosInstance.post<ApiResponse<DeliveryPartner>>(
                '/deliveryPartner/createDeliveryPartner',
                data
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to create delivery partner.'
            );
        }
    },

    // Update delivery partner
    async updateDeliveryPartner(
        id: string,
        updateData: UpdateDeliveryPartnerData
    ): Promise<ApiResponse<DeliveryPartner>> {
        try {
            const response = await axiosInstance.put<ApiResponse<DeliveryPartner>>(
                `/deliveryPartner/updateDeliveryPartner/${id}`,
                updateData
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to update delivery partner.'
            );
        }
    },

    // Delete delivery partner
    async deleteDeliveryPartner(id: string): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.delete<ApiResponse<void>>(
                `/deliveryPartner/deleteDeliveryPartner/${id}`
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to delete delivery partner.'
            );
        }
    },

    // Update FCM Token
    async updateFcmToken(fcmToken: string): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.post<ApiResponse<void>>(
                '/deliveryPartner/update-fcm-token',
                { fcmToken }
            );
            return response.data;
        } catch (error: any) {
            console.error('Failed to update FCM token', error);
            throw new Error(error.response?.data?.message || 'Failed to update FCM token');
        }
    },

    // Logout (clear token)
    async logout(): Promise<void> {
        await tokenManager.removeToken();
    },
};
