import axiosInstance from './axiosInstance';
import { ApiResponse, Product } from './productApi';

export interface Category {
    name: string;
    image: string;
    productCount: number;
}

export const categoryApi = {
    // Get all categories (public)
    async getAllCategories(): Promise<ApiResponse<Category[]>> {
        try {
            const response = await axiosInstance.get('/category/getAllCategories');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch categories',
                errorDetails: error.response?.data
            };
        }
    },

    // Get products by category (public)
    async getProductsByCategory(categoryName: string): Promise<ApiResponse<Product[]>> {
        try {
            const response = await axiosInstance.get(`/category/getProductsByCategory/${encodeURIComponent(categoryName)}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch products for this category',
                errorDetails: error.response?.data
            };
        }
    }
};
