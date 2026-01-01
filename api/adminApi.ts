import axiosInstance, { tokenManager } from './axiosInstance';

// Admin types
export interface Admin {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'super_admin';
}

export interface UpdateAdminData {
  name?: string;
  email?: string;
  role?: 'admin' | 'super_admin';
  isActive?: boolean;
}

// Admin API functions
export const adminApi = {
  // Login admin
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>('/admin/loginAdmin', {
        email,
        password,
      });

      if (response.data.success && response.data.data.token) {
        // Save token and admin data
        await tokenManager.saveToken(response.data.data.token);
        await tokenManager.saveAdminData(response.data.data.admin);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  },

  // Get all admins
  async getAllAdmins(): Promise<ApiResponse<Admin[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Admin[]>>(
        '/admin/getAllAdmins'
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch admins.'
      );
    }
  },

  // Get admin by ID
  async getAdminById(id: string): Promise<ApiResponse<Admin>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Admin>>(
        `/admin/getAdminById/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch admin.'
      );
    }
  },

  // Create admin
  async createAdmin(adminData: CreateAdminData): Promise<ApiResponse<Admin>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Admin>>(
        '/admin/createAdmin',
        adminData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create admin.'
      );
    }
  },

  // Update admin
  async updateAdmin(
    id: string,
    updateData: UpdateAdminData
  ): Promise<ApiResponse<Admin>> {
    try {
      const response = await axiosInstance.put<ApiResponse<Admin>>(
        `/admin/updateAdmin/${id}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update admin.'
      );
    }
  },

  // Delete admin
  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        `/admin/deleteAdmin/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete admin.'
      );
    }
  },

  // Logout (clear token)
  async logout(): Promise<void> {
    await tokenManager.removeToken();
  },
};

