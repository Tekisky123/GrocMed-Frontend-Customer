import axiosInstance from './axiosInstance';

export interface Banner {
    _id: string;
    title?: string;
    description?: string;
    image: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
}

export const bannerApi = {
    getBanners: async (): Promise<{ success: boolean; data: Banner[]; message?: string }> => {
        try {
            const response = await axiosInstance.get('/banners');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch banners',
            };
        }
    },
};
