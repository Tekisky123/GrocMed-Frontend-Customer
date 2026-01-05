import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

interface CartesianPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CartAnimationContextType {
    startAnimation: (startLayout: CartesianPosition, imageUri: string, onFinish?: () => void) => void;
    setCartIconPosition: (layout: { x: number; y: number; width: number; height: number; }) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
    const [animationItem, setAnimationItem] = useState<{ x: number; y: number; width: number; height: number; image: string } | null>(null);
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Default target position (Top Right estimation if not set)
    // Default target position (Bottom Center estimation if not set, e.g., Sticky Bar)
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const [cartPosition, setCartPosition] = useState({ x: windowWidth / 2, y: windowHeight - 50, width: 30, height: 30 });

    const setCartIconPosition = (layout: { x: number; y: number; width: number; height: number }) => {
        // Only update if significantly different to avoid loops
        if (Math.abs(layout.x - cartPosition.x) > 5 || Math.abs(layout.y - cartPosition.y) > 5) {
            setCartPosition(layout);
        }
    };

    const startAnimation = (startLayout: CartesianPosition, imageUri: string, onFinish?: () => void) => {
        if (!imageUri) {
            onFinish?.();
            return;
        }

        setAnimationItem({ ...startLayout, image: imageUri });
        animatedValue.setValue(0);

        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.2, 1, 0.2, 1), // "Seagull" curve / ease-out-back feeling
            useNativeDriver: false, // Layout props need JS driver usually
        }).start(() => {
            setAnimationItem(null);
            if (onFinish) onFinish();
        });
    };

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
                            outputRange: [animationItem.y, cartPosition.y]
                        }),
                        left: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.x, cartPosition.x]
                        }),
                        width: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.width, 10] // Shrink to tiny dot
                        }),
                        height: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [animationItem.height, 10]
                        }),
                        opacity: animatedValue.interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [1, 0.8, 0] // Fade out at end
                        }),
                        borderRadius: 999, // Circle
                        zIndex: 9999,
                    } as any}
                />
            )}
        </CartAnimationContext.Provider>
    );
}

export const useCartAnimation = () => {
    const context = useContext(CartAnimationContext);
    if (!context) return { startAnimation: () => { }, setCartIconPosition: () => { } }; // Safe fallback
    return context;
};
