import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartAnimationProvider } from '@/contexts/CartAnimationContext';
import { CartProvider } from '@/contexts/CartContext';
import { DeliveryPartnerProvider } from '@/contexts/DeliveryPartnerContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { setupNotificationListeners } from '@/utils/notificationHelper';
import { StickyCartBar } from '@/components/ui/StickyCartBar';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setVisibilityAsync('hidden');
      } catch (e) {
        console.log("NavigationBar error", e);
      }
    }

    let unsubscribe: any;

    try {
      unsubscribe = setupNotificationListeners((orderId: string) => {
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 500);
      });
    } catch (e) {
      console.log("Notification setup failed", e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return null;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <DeliveryPartnerProvider>
            <CartAnimationProvider>
              <CartProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }} />
                  <StatusBar hidden />
                  <StickyCartBar />
                </ThemeProvider>
              </CartProvider>
            </CartAnimationProvider>
          </DeliveryPartnerProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
