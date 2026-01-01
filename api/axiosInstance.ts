import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API
// For Android Emulator: use 'http://10.0.2.2:3000/api'
// For iOS Simulator: use 'http://localhost:3000/api'
// For Physical Device: use your computer's IP address, e.g., 'http://192.168.1.100:3000/api'
const BASE_URL = 'https://groc-med-backend.vercel.app/api';
// const BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads (Vercel allows up to 60s on Pro plan)
  maxContentLength: Infinity, // Allow large content
  maxBodyLength: Infinity, // Allow large body
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = '@admin_token';
const ADMIN_DATA_KEY = '@admin_data';

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // For FormData, let the browser/React Native set the Content-Type with boundary
      // Don't set it manually - it will be set automatically
      if (config.data instanceof FormData) {
        // Remove any existing Content-Type to let the platform set it with boundary
        delete config.headers['Content-Type'];
        // Also ensure we're not transforming the FormData
        if (!config.transformRequest) {
          config.transformRequest = [];
        }
      }
    } catch {
      // Error getting token from storage
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token is expired or invalid, clear storage and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(ADMIN_DATA_KEY);
      } catch {
        // Error clearing storage
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const tokenManager = {
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {
      throw new Error('Failed to save token');
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(ADMIN_DATA_KEY);
    } catch {
      throw new Error('Failed to remove token');
    }
  },

  async saveAdminData(adminData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
    } catch (error) {
      throw error;
    }
  },

  async getAdminData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(ADMIN_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};

export default axiosInstance;

