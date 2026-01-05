import axiosInstance from './axiosInstance';

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  unitType: string;
  perUnitWeightVolume: string;
  unitsPerUnitType: number;
  mrp: number;
  offerPrice: number;
  singleUnitPrice: number;
  stock: number;
  minimumQuantity?: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  manfDate?: string;
  expiryDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  errorDetails?: any; // For debugging purposes
}

// Product API functions
export const productApi = {
  // Get all products (public)
  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Product[]>>('/product/getAllProducts');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get product by ID (public)
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/product/getProductById/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product',
      };
    }
  },

  // Search products (public)
  async searchProducts(query: string, category?: string): Promise<ApiResponse<Product[]>> {
    try {
      const params: any = {};
      if (query) params.query = query;
      if (category) params.category = category;

      const response = await axiosInstance.get<ApiResponse<Product[]>>('/product/search', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Search failed',
      };
    }
  },

  // Get suggested products based on category (public)
  async getSuggestedProducts(id: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Product[]>>(`/product/suggested/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch suggested products',
      };
    }
  },
};

export default productApi;
