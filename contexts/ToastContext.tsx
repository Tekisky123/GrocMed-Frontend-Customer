import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_HEIGHT = 60;
const { width } = Dimensions.get('window');

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const [visible, setVisible] = useState(false);

    // Animations
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback((msg: string, type: ToastType = 'info') => {
        // Clear existing timeout to prevent early dismissal if spamming
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        setMessage(msg);
        setType(type);
        setVisible(true);

        // Animate In
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: Platform.OS === 'ios' ? 60 : 40, // Top offset
                useNativeDriver: true,
                friction: 5,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-hide after delay
        hideTimeoutRef.current = setTimeout(() => {
            hideToast();
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    }, []);

    // Get styles based on type
    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: Colors.surface, // Clean white background
                    borderLeftColor: Colors.success, // Green Accent
                    icon: 'check-circle',
                    iconColor: Colors.success,
                    title: 'Success',
                };
            case 'error':
                return {
                    backgroundColor: Colors.surface,
                    borderLeftColor: Colors.error, // Red Accent
                    icon: 'error',
                    iconColor: Colors.error,
                    title: 'Error',
                };
            case 'info':
            default:
                return {
                    backgroundColor: Colors.surface,
                    borderLeftColor: Colors.primary, // Orange Accent
                    icon: 'info',
                    iconColor: Colors.primary, // Orange Icon
                    title: 'Info',
                };
        }
    };

    const styleConfig = getToastStyle();

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* Toast Component Overlay */}
            <Animated.View
                style={[
                    styles.toastContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                <View style={[
                    styles.toastCard,
                    {
                        borderLeftColor: styleConfig.borderLeftColor
                    }
                ]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${styleConfig.iconColor}15` }]}>
                        {/* Using material library for standard icons */}
                        <Icon
                            name={styleConfig.icon}
                            size={24}
                            color={styleConfig.iconColor}
                            library="material"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{styleConfig.title}</Text>
                        <Text style={styles.message} numberOfLines={2}>
                            {message}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                        <Icon name="close" size={18} color={Colors.textTertiary} library="material" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toastCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Pure white
        borderRadius: 12,
        padding: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderLeftWidth: 6,
        borderWidth: 1, // Add subtle border for definition
        borderColor: '#f0f0f0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a', // Dark text
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#666666', // Secondary text
        fontWeight: '500',
    },
    closeButton: {
        padding: 8,
    },
});

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
