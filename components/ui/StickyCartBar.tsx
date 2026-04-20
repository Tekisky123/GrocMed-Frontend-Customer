import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { router, useSegments } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';

export function StickyCartBar() {
    const { cart, getItemCount } = useCart();
    const { setCartIconPosition } = useCartAnimation();
    const segments = useSegments();
    const slideAnim = useRef(new Animated.Value(200)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isShown = useRef(false);

    const hiddenRoutes = ['cart', 'checkout', 'auth'];
    const currentRoute = segments[segments.length - 1];
    const isRouteHidden = hiddenRoutes.includes(currentRoute);

    const hideBar = useCallback(() => {
        isShown.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        Animated.timing(slideAnim, {
            toValue: 200,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [slideAnim]);

    const showBar = useCallback(() => {
        isShown.current = true;
        Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 45,
            useNativeDriver: true,
        }).start();
    }, [slideAnim]);

    useEffect(() => {
        if (cart.items.length > 0 && !isRouteHidden) {
            showBar();
        } else {
            hideBar();
        }
    }, [cart.items.length, isRouteHidden, showBar, hideBar]);

    if (cart.items.length === 0) return null;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 50 : 40,
                left: 20,
                right: 20,
                transform: [{ translateY: slideAnim }],
                zIndex: 9999,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 10,
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    router.push('/(tabs)/cart');
                }}
                activeOpacity={0.9}
                // CRITICAL FIX: measureInWindow only called on press, not on render
                // This prevents an infinite loop of measure → setCartIconPosition → re-render
                onLayout={(e) => {
                    const { x, y, width, height } = e.nativeEvent.layout;
                    setCartIconPosition({ x, y, width, height });
                }}
                style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginRight: 12,
                    }}>
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                            {getItemCount()} ITEM{getItemCount() !== 1 ? 'S' : ''}
                        </Text>
                    </View>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', opacity: 0.9 }}>Total</Text>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>₹{cart.total}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginRight: 8 }}>View Cart</Text>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 6 }}>
                        <Icon name="shopping-bag" size={16} color="#fff" library="material" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
