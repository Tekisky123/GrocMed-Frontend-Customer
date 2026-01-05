import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';

export function StickyCartBar() {
    const { cart, getItemCount } = useCart();
    const { setCartIconPosition } = useCartAnimation();
    const segments = useSegments();
    const slideAnim = useRef(new Animated.Value(200)).current; // Start hidden (offset)

    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<any>(null);

    const hiddenRoutes = ['cart', 'checkout', 'auth'];
    const currentRoute = segments[segments.length - 1];
    const isRouteHidden = hiddenRoutes.includes(currentRoute);

    // Watch for cart changes to trigger visibility
    useEffect(() => {
        // Only show if we have items and are not on a hidden route
        // This effect runs on mount and whenever cart.items.length changes
        if (cart.items.length > 0 && !isRouteHidden) {
            showBar();
        } else {
            hideBar();
        }
    }, [cart.items.length, cart.total, isRouteHidden]);

    const showBar = () => {
        setIsVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);

        Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();

        // Auto-hide after 3 seconds as requested
        timerRef.current = setTimeout(() => {
            hideBar();
        }, 3000);
    };

    const hideBar = () => {
        setIsVisible(false);
        Animated.timing(slideAnim, {
            toValue: 200,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    if (cart.items.length === 0) return null;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 50 : 40, // "Little bit upper"
                left: 20,
                right: 20,
                transform: [{ translateY: slideAnim }],
                zIndex: 9999,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                // elevation: 10,
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    router.push('/(tabs)/cart');
                }}
                activeOpacity={0.9}
                // Use ref just to update position if visible
                ref={(view) => {
                    view?.measureInWindow((x, y, width, height) => {
                        if (isVisible) {
                            setCartIconPosition({ x: x + width / 2, y: y + height / 2, width, height });
                        }
                    });
                }}
                style={{
                    backgroundColor: Colors.primary, // Orange as requested
                    borderRadius: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)', // Subtle border
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
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{getItemCount()} ITEM{getItemCount() !== 1 ? 'S' : ''}</Text>
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
