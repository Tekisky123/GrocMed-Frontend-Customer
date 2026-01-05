import { tokenManager } from '@/api/axiosInstance'; // Use tokenManager from axiosInstance
import { DeliveryPartner, deliveryPartnerApi } from '@/api/deliveryPartnerApi';
import { ensureNotificationPermission, getFCMToken } from '@/utils/notificationHelper';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface DeliveryPartnerContextType {
    deliveryPartner: DeliveryPartner | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshDeliveryPartnerData: () => Promise<void>;
}

const DeliveryPartnerContext = createContext<DeliveryPartnerContextType | undefined>(undefined);

export function DeliveryPartnerProvider({ children }: { children: React.ReactNode }) {
    const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            const token = await tokenManager.getToken();
            const partnerData = await tokenManager.getDeliveryPartnerData();

            if (token && partnerData) {
                setDeliveryPartner(partnerData);
                setIsAuthenticated(true);

                // Sync notification token quietly on load
                ensureNotificationPermission().then(async (granted) => {
                    if (granted) {
                        const fcmToken = await getFCMToken();
                        if (fcmToken) deliveryPartnerApi.updateFcmToken(fcmToken);
                    }
                });

            } else {
                setIsAuthenticated(false);
                setDeliveryPartner(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setDeliveryPartner(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await deliveryPartnerApi.login(email, password);

            if (response.success && response.data) {
                setDeliveryPartner(response.data.deliveryPartner);
                setIsAuthenticated(true);

                // Request Permission and Sync Token
                ensureNotificationPermission().then(async (granted) => {
                    if (granted) {
                        const fcmToken = await getFCMToken();
                        if (fcmToken) deliveryPartnerApi.updateFcmToken(fcmToken);
                    }
                });

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
            await deliveryPartnerApi.logout();
            setDeliveryPartner(null);
            setIsAuthenticated(false);
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local state even if API call fails
            setDeliveryPartner(null);
            setIsAuthenticated(false);
            router.replace('/auth/login');
        }
    }, []);

    const refreshDeliveryPartnerData = useCallback(async (): Promise<void> => {
        try {
            const partnerData = await tokenManager.getDeliveryPartnerData();
            if (partnerData) {
                setDeliveryPartner(partnerData);
            }
        } catch (error) {
            console.error('Error refreshing delivery partner data:', error);
        }
    }, []);

    return (
        <DeliveryPartnerContext.Provider
            value={{
                deliveryPartner,
                isAuthenticated,
                isLoading,
                login,
                logout,
                refreshDeliveryPartnerData,
            }}
        >
            {children}
        </DeliveryPartnerContext.Provider>
    );
}

export function useDeliveryPartner() {
    const context = useContext(DeliveryPartnerContext);
    if (!context) {
        throw new Error('useDeliveryPartner must be used within DeliveryPartnerProvider');
    }
    return context;
}
