import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '@/types';
import { MOCK_USER } from '@/constants/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phoneOrEmail: string, otp: string) => Promise<boolean>;
  register: (phoneOrEmail: string, name: string, otp: string) => Promise<boolean>;
  sendOTP: (phoneOrEmail: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock OTP storage (in real app, this would be handled by backend)
const mockOTPStore: Record<string, string> = {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER); // Start with mock user for demo
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const sendOTP = useCallback(async (phoneOrEmail: string): Promise<boolean> => {
    // Mock OTP generation
    const otp = '123456'; // In real app, this would come from backend
    mockOTPStore[phoneOrEmail] = otp;
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log(`OTP sent to ${phoneOrEmail}: ${otp}`); // For demo purposes
    return true;
  }, []);

  const login = useCallback(async (phoneOrEmail: string, otp: string): Promise<boolean> => {
    // Mock OTP validation
    const storedOTP = mockOTPStore[phoneOrEmail];
    if (storedOTP === otp || otp === '123456') {
      // In real app, this would fetch user from backend
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      delete mockOTPStore[phoneOrEmail];
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (phoneOrEmail: string, name: string, otp: string): Promise<boolean> => {
    // Mock registration
    const storedOTP = mockOTPStore[phoneOrEmail];
    if (storedOTP === otp || otp === '123456') {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        phone: phoneOrEmail.startsWith('+') ? phoneOrEmail : `+91 ${phoneOrEmail}`,
        email: phoneOrEmail.includes('@') ? phoneOrEmail : undefined,
        addresses: [],
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      setIsAuthenticated(true);
      delete mockOTPStore[phoneOrEmail];
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        sendOTP,
        logout,
        updateUser,
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

