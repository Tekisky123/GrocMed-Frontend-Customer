import { Colors } from '@/constants/colors';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageStyle, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface StartupAnimationProps {
    onFinish: () => void;
}

export function StartupAnimation({ onFinish }: StartupAnimationProps) {
    // Animation values
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const sloganOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(20)).current;
    const promiseOpacity = useRef(new Animated.Value(0)).current;
    const promiseTranslateY = useRef(new Animated.Value(40)).current;
    const bgOpacity = useRef(new Animated.Value(0)).current; // Background transition

    useEffect(() => {
        Animated.sequence([
            // 0. Intro Background
            Animated.timing(bgOpacity, {
                toValue: 1,
                duration: 300, // Faster
                useNativeDriver: true,
            }),

            // 1. Logo Fade In & Scale Up (Pop effect)
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 500, // Faster
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 60, // Snappier
                    useNativeDriver: true,
                }),
            ]),

            // 2. Slogan Fade In & Slide Up
            Animated.parallel([
                Animated.timing(sloganOpacity, {
                    toValue: 1,
                    duration: 400, // Faster
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            // 3. Promise "4 Hour Delivery" Slide Up - Staggered
            Animated.delay(100), // Short delay
            Animated.parallel([
                Animated.timing(promiseOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(promiseTranslateY, {
                    toValue: 0,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),

            // 4. Hold for a moment to read
            Animated.delay(1200), // Short hold

            // 5. Smooth Fade Out
            Animated.parallel([
                Animated.timing(logoOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(sloganOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(promiseOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(bgOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            ])
        ]).start(() => {
            onFinish();
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.bgLayer, { opacity: bgOpacity }]} />

            <View style={styles.content}>
                {/* Logo */}
                <Animated.Image
                    source={require('@/assets/images/logo-removebg-preview.png')}
                    style={[
                        styles.logo,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ] as unknown as ImageStyle}
                    resizeMode="contain"
                />

                {/* Slogan */}
                <Animated.View style={{ opacity: sloganOpacity, transform: [{ translateY: textTranslateY }] }}>
                    <Text style={styles.slogan}>Groceries Made Simple</Text>
                </Animated.View>

                {/* Delivery Promise */}
                <Animated.View style={{
                    marginTop: 40,
                    opacity: promiseOpacity,
                    transform: [{ translateY: promiseTranslateY }],
                    alignItems: 'center'
                }}>
                    <View style={styles.promiseBadge}>
                        <Text style={styles.promiseText}>⚡ 4 HOUR DELIVERY</Text>
                    </View>
                    <Text style={styles.subText}>Fast & Reliable B2B Service</Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background, // Fallback
    } as ViewStyle,
    bgLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
    } as ViewStyle,
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    } as ViewStyle,
    logo: {
        width: width * 0.75, // responsive width
        height: 140,
        marginBottom: 24,
    } as ImageStyle,
    slogan: {
        fontSize: 24, // Bigger Slogan
        fontWeight: '700',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
        textAlign: 'center',
    } as TextStyle,
    promiseBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 50,
        marginBottom: 10,
        // Elevation removed
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    } as ViewStyle,
    promiseText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    } as TextStyle,
    subText: {
        fontSize: 15,
        color: Colors.textTertiary,
        fontWeight: '500',
    } as TextStyle
});
