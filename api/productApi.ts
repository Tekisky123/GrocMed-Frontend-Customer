import axiosInstance, { tokenManager } from './axiosInstance';

// Product types
export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  errorDetails?: any; // For debugging purposes
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  isActive?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
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

  // Get all products for admin (includes inactive)
  async getAllProductsForAdmin(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Product[]>>('/product/getAllProductsForAdmin');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get product by ID for admin (includes inactive)
  async getProductByIdForAdmin(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(`/product/getProductByIdForAdmin/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product',
      };
    }
  },

  // Create product (admin only)
  async createProduct(
    productData: CreateProductData,
    images: { uri: string; type: string; name: string }[]
  ): Promise<ApiResponse<Product>> {
    try {
      // Use native React Native FormData - no polyfills
      const formData = new FormData();

      // Append all non-file fields as strings
      formData.append('name', String(productData.name));
      formData.append('description', String(productData.description));
      formData.append('price', String(productData.price));
      formData.append('category', String(productData.category));

      if (productData.stock !== undefined) {
        formData.append('stock', String(productData.stock));
      }

      if (productData.isActive !== undefined) {
        formData.append('isActive', String(productData.isActive));
      }

      // Append each image individually using the same field name "images"
      // Format: { uri, type, name } - do NOT stringify, do NOT wrap in arrays
      // Note: Vercel has request body size limits (4.5MB Hobby, 50MB Pro)
      // Consider uploading images one at a time or using a direct upload service for large files
      images.forEach((img, i) => {
        const imageUri = img.uri.startsWith('file://') || img.uri.startsWith('content://')
          ? img.uri
          : `file://${img.uri}`;
        const imageType = img.type || 'image/jpeg';
        const imageName = img.name || `image_${i}.jpg`;

        formData.append('images', {
          uri: imageUri,
          type: imageType,
          name: imageName,
        } as any);
      });

      // Get token for authorization
      const token = await tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please login again.',
        };
      }

      // Use axios - do NOT set Content-Type header manually
      const response = await axiosInstance.post('/product/createProduct', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000, // 60 seconds for file uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      // Log detailed error for debugging
      const errorDetails = {
        code: error.code,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : null,
        request: error.request ? 'Request made but no response' : null,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
        } : null,
      };

      // Log to console for debugging (visible in React Native debugger/terminal)
      console.error('[PRODUCT API ERROR] Create Product:', JSON.stringify(errorDetails, null, 2));

      // Enhanced error handling for network errors
      let errorMessage = 'Failed to create product';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = `Request timeout (${error.config?.timeout || 60000}ms). The upload is taking too long. Please try with fewer or smaller images.`;
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || error.message?.includes('Network request failed')) {
        errorMessage = `Network error: ${error.message || 'Please check your internet connection and try again.'}`;
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown server error';
        errorMessage = `Server error (${status}): ${serverMessage}`;
        if (error.response.data?.details) {
          errorMessage += `\nDetails: ${JSON.stringify(error.response.data.details)}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = `No response from server. URL: ${error.config?.url || 'unknown'}. Please check your connection and server status.`;
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      }

      return {
        success: false,
        message: errorMessage,
        errorDetails: errorDetails, // Include details for debugging
      };
    }
  },
  

  // Update product (admin only)
  async updateProduct(
    id: string,
    productData: UpdateProductData,
    newImages: { uri: string; type: string; name: string }[] = [],
    existingImages: string[] = []
  ): Promise<ApiResponse<Product>> {
    try {
      // Use native React Native FormData
      const formData = new FormData();

      // Append all non-file fields as strings
      if (productData.name) formData.append('name', String(productData.name));
      if (productData.description) formData.append('description', String(productData.description));
      if (productData.price !== undefined) formData.append('price', String(productData.price));
      if (productData.category) formData.append('category', String(productData.category));
      if (productData.stock !== undefined) formData.append('stock', String(productData.stock));
      if (productData.isActive !== undefined) formData.append('isActive', String(productData.isActive));

      // Append existing images to keep (as JSON string, not file)
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append each new image individually using the same field name "images"
      // Format: { uri, type, name } - do NOT stringify, do NOT wrap in arrays
      newImages.forEach((img, i) => {
        const imageUri = img.uri.startsWith('file://') || img.uri.startsWith('content://')
          ? img.uri
          : `file://${img.uri}`;
        const imageType = img.type || 'image/jpeg';
        const imageName = img.name || `image_${i}.jpg`;

        formData.append('images', {
          uri: imageUri,
          type: imageType,
          name: imageName,
        } as any);
      });

      // Get token for authorization
      const token = await tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication required. Please login again.',
        };
      }

      // Use axios - do NOT set Content-Type header manually
      const response = await axiosInstance.put(`/product/updateProduct/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000, // 60 seconds for file uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      // Log detailed error for debugging
      const errorDetails = {
        code: error.code,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : null,
        request: error.request ? 'Request made but no response' : null,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
        } : null,
      };

      // Log to console for debugging (visible in React Native debugger/terminal)
      console.error('[PRODUCT API ERROR] Update Product:', JSON.stringify(errorDetails, null, 2));

      // Enhanced error handling for network errors
      let errorMessage = 'Failed to update product';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = `Request timeout (${error.config?.timeout || 60000}ms). The upload is taking too long. Please try with fewer or smaller images.`;
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || error.message?.includes('Network request failed')) {
        errorMessage = `Network error: ${error.message || 'Please check your internet connection and try again.'}`;
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown server error';
        errorMessage = `Server error (${status}): ${serverMessage}`;
        if (error.response.data?.details) {
          errorMessage += `\nDetails: ${JSON.stringify(error.response.data.details)}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = `No response from server. URL: ${error.config?.url || 'unknown'}. Please check your connection and server status.`;
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      }

      return {
        success: false,
        message: errorMessage,
        errorDetails: errorDetails, // Include details for debugging
      };
    }
  },

  // Delete product (admin only)
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/product/deleteProduct/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete product',
      };
    }
  },

  // Delete product image (admin only)
  async deleteProductImage(id: string, imageUrl: string): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<Product>>(`/product/deleteProductImage/${id}`, {
        data: { imageUrl },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete image',
      };
    }
  },
};
