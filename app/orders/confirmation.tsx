import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';

export default function OrderConfirmationScreen() {
    const { orderId, total } = useLocalSearchParams();

    // Prevent going back to checkout
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            router.replace('/(tabs)/');
            return true;
        });
        return () => backHandler.remove();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 30 }}>

            <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: Colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 30,
                shadowColor: Colors.success,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                // elevation: 10
            }}>
                <Icon name="check" size={60} color={Colors.textWhite} library="material" />
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' }}>
                Order Placed!
            </Text>

            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 30, textAlign: 'center', lineHeight: 24 }}>
                Your order <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{orderId ? `#${orderId.toString().slice(-6)}` : ''}</Text> has been successfully placed. We'll deliver your items shortly.
            </Text>

            <View style={{ width: '100%', gap: 16 }}>
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)/orders')}
                    style={{
                        backgroundColor: Colors.primary,
                        paddingVertical: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        // elevation: 4
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: Colors.textWhite, fontWeight: '700', fontSize: 16 }}>
                        Track Order
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)/')}
                    style={{
                        backgroundColor: Colors.textWhite,
                        paddingVertical: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: Colors.border
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: Colors.textPrimary, fontWeight: '700', fontSize: 16 }}>
                        Continue Shopping
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
