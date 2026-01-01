import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Admin, adminApi, tokenManager } from '@/api/adminApi';
import { router } from 'expo-router';

interface AdminContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await tokenManager.getToken();
      const adminData = await tokenManager.getAdminData();
      
      if (token && adminData) {
        setAdmin(adminData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await adminApi.login(email, password);
      
      if (response.success && response.data) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await adminApi.logout();
      setAdmin(null);
      setIsAuthenticated(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      setAdmin(null);
      setIsAuthenticated(false);
      router.replace('/auth/login');
    }
  }, []);

  const refreshAdminData = useCallback(async (): Promise<void> => {
    try {
      const adminData = await tokenManager.getAdminData();
      if (adminData) {
        setAdmin(adminData);
      }
    } catch (error) {
      console.error('Error refreshing admin data:', error);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAdminData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

