import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

interface CartesianPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CartAnimationContextType {
    startAnimation: (startLayout: CartesianPosition, imageUri: string, onFinish?: () => void) => void;
    setCartIconPosition: (layout: CartesianPosition) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
    const [animationItem, setAnimationItem] = useState<{
        x: number; y: number; width: number; height: number; image: string
    } | null>(null);

    const animatedValue = useRef(new Animated.Value(0)).current;

    // Store cart position in a ref to avoid re-renders when position changes
    const cartPositionRef = useRef({ x: windowWidth / 2, y: windowHeight - 50, width: 30, height: 30 });

    // Stable callback — never causes re-renders in consumers
    const setCartIconPosition = useCallback((layout: CartesianPosition) => {
        // Use ref to avoid triggering re-renders — position is only read during animation
        const prev = cartPositionRef.current;
        if (
            Math.abs(layout.x - prev.x) > 5 ||
            Math.abs(layout.y - prev.y) > 5
        ) {
            cartPositionRef.current = layout;
        }
    }, []);

    const startAnimation = useCallback((startLayout: CartesianPosition, imageUri: string, onFinish?: () => void) => {
        if (!imageUri) {
            onFinish?.();
            return;
        }

        setAnimationItem({ ...startLayout, image: imageUri });
        animatedValue.setValue(0);

        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 700,
            easing: Easing.bezier(0.2, 1, 0.2, 1),
            useNativeDriver: false,
        }).start(() => {
            setAnimationItem(null);
            onFinish?.();
        });
    }, [animatedValue]);

    return (
        <CartAnimationContext.Provider value={{ startAnimation, setCartIconPosition }}>
            {children}
            {animationItem && (
                <Animated.Image
                    source={{ uri: animationItem.image }}
                    style={{
                        position: 'absolute',
                        top: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.y, cartPositionRef.current.y],
                        }),
                        left: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.x, cartPositionRef.current.x],
                        }),
                        width: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.width, 10],
                        }),
                        height: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.height, 10],
                        }),
                        opacity: animatedValue.interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [1, 0.8, 0],
                        }),
                        borderRadius: 999,
                        zIndex: 9999,
                    } as any}
                />
            )}
        </CartAnimationContext.Provider>
    );
}

export const useCartAnimation = () => {
    const context = useContext(CartAnimationContext);
    if (!context) return { startAnimation: () => { }, setCartIconPosition: () => { } };
    return context;
};
