import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export const BASE_URL = 'https://grocmed-backend-production.up.railway.app/api';
// const BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads (Vercel allows up to 60s on Pro plan)
  maxContentLength: Infinity, // Allow large content
  maxBodyLength: Infinity, // Allow large body
});

// Token storage keys
// Token storage keys
const TOKEN_KEY = 'token';
const USER_DATA_KEY = '@user_data';
const DELIVERY_PARTNER_DATA_KEY = '@delivery_partner_data';

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Check if data is FormData robustly (handling React Native environment)
      const isFormData = config.data && (
        config.data instanceof FormData || 
        (typeof config.data === 'object' && (typeof config.data.append === 'function' || '_parts' in config.data))
      );
      if (isFormData) {
        // Delete Content-Type header to let the native request generator set it automatically
        // with the correct multipart boundary parameter.
        config.headers.delete('Content-Type');
      } else if (!config.headers.get('Content-Type')) {
        config.headers.set('Content-Type', 'application/json');
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
        console.warn('Unauthorized request detected, clearing session...');
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_DATA_KEY, DELIVERY_PARTNER_DATA_KEY]);
        // Note: Actual navigation redirect is often best handled by a Root Navigation listener 
        // but clearing state here triggers AuthContext re-evaluation.
      } catch (e) {
        console.error('Error during 401 session cleanup:', e);
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
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(DELIVERY_PARTNER_DATA_KEY);
    } catch {
      throw new Error('Failed to remove token');
    }
  },

  async saveUserData(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveDeliveryPartnerData(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(DELIVERY_PARTNER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  },

  async getDeliveryPartnerData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(DELIVERY_PARTNER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async removeDeliveryPartnerData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DELIVERY_PARTNER_DATA_KEY);
    } catch {
      // ignore
    }
  },
};

export default axiosInstance;

