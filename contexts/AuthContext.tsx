import { tokenManager } from '@/api/axiosInstance'; // Use tokenManager
import { customerApi } from '@/api/customerApi';
import { User } from '@/types';
import { getFCMToken, requestUserPermission } from '@/utils/notificationHelper';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ... (keep types)

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await tokenManager.getToken(); // Use tokenManager
      if (token) {
        setIsAuthenticated(true);
        // Fetch profile
        const res = await customerApi.getProfile();
        if (res.success && res.data) {
          const userData: User = {
            id: res.data._id || res.data.id,
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            addresses: res.data.addresses || [],
            pan: res.data.pan,
            adhaar: res.data.adhaar,
            createdAt: res.data.createdAt,
            isVerified: true
          };
          setUser(userData);

          // Sync FCM Token quietly on load
          const hasPermission = await requestUserPermission();
          if (hasPermission) {
            const fcmToken = await getFCMToken();
            if (fcmToken) {
              customerApi.updateFcmToken(fcmToken);
            }
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to load user', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (data: any) => {
    const res = await customerApi.login(data);
    if (res.success && res.token) {
      await tokenManager.saveToken(res.token); // Use tokenManager
      setIsAuthenticated(true);

      const profileRes = await customerApi.getProfile();
      if (profileRes.success && profileRes.data) {
        const userData: User = {
          id: profileRes.data._id || profileRes.data.id,
          name: profileRes.data.name,
          email: profileRes.data.email,
          phone: profileRes.data.phone,
          addresses: profileRes.data.addresses || [],
          pan: profileRes.data.pan,
          adhaar: profileRes.data.adhaar,
          createdAt: profileRes.data.createdAt,
          isVerified: true
        };
        setUser(userData);

        // Request Notification Permission & Sync Token
        const hasPermission = await requestUserPermission();
        if (hasPermission) {
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            await customerApi.updateFcmToken(fcmToken);
          }
        }
      }
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const register = useCallback(async (data: any) => {
    const res = await customerApi.register(data);
    if (res.success) {
      if (res.token) {
        await tokenManager.saveToken(res.token); // Use tokenManager
        setIsAuthenticated(true);

        const profileRes = await customerApi.getProfile();
        if (profileRes.success && profileRes.data) {
          const userData: User = {
            id: profileRes.data._id || profileRes.data.id,
            name: profileRes.data.name,
            email: profileRes.data.email,
            phone: profileRes.data.phone,
            addresses: profileRes.data.addresses || [],
            pan: profileRes.data.pan,
            adhaar: profileRes.data.adhaar,
            createdAt: profileRes.data.createdAt,
            isVerified: true
          };
          setUser(userData);

          // Request Notification Permission & Sync Token
          const hasPermission = await requestUserPermission();
          if (hasPermission) {
            const fcmToken = await getFCMToken();
            if (fcmToken) {
              await customerApi.updateFcmToken(fcmToken);
            }
          }
        }
      }
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  }, []);

  const logout = useCallback(async () => {
    await tokenManager.removeToken(); // Use tokenManager
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const res = await customerApi.updateProfile(data);
    if (res.success && res.data) {
      // Update local state with returned data
      const userData: User = {
        id: res.data._id || res.data.id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        addresses: res.data.addresses || [],
        createdAt: res.data.createdAt,
        isVerified: true
      };
      setUser(userData);
      return { success: true, message: 'Profile updated successfully' };
    }
    return { success: false, message: res.message || 'Failed to update profile' };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

