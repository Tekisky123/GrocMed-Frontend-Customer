import { orderApi } from '@/api/orderApi';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

interface TrackingStep {
    status: string;
    timestamp: string;
    description: string;
    location?: string;
    completed: boolean;
}

export default function OrderTrackingScreen() {
    const { id } = useLocalSearchParams();
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTracking();
        }
    }, [id]);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            const res = await orderApi.trackOrder(id as string);
            if (res.success) {
                setTrackingData(res.data || res); // Handle if data is nested or direct
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { key: 'placed', label: 'Order Placed', icon: 'shopping-cart' },
        { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
        { key: 'packed', label: 'Packed', icon: 'inventory-2' },
        { key: 'shipped', label: 'Shipped', icon: 'local-shipping' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'delivery-dining' },
        { key: 'delivered', label: 'Delivered', icon: 'home' }
    ];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Flatten history for easier rendering if available, else infer from status
    const currentStatus = trackingData?.orderStatus?.toLowerCase() || 'pending';
    const history = trackingData?.trackingHistory || [];

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <PageHeader title="Track Order" />
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 100 }}>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>
                        Order #{id?.toString().slice(-6)}
                    </Text>
                    <Text style={{ color: Colors.textSecondary }}>Arriving soon</Text>
                </View>

                <View style={{ backgroundColor: Colors.textWhite, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.gray200 }}>
                    {steps.map((step, index) => {
                        // Determine state of this step
                        // Simple logic: if index <= step found in history or based on currentStatus priority
                        // We need a reliable way to map status to order.
                        const stepIndices = steps.map(s => s.key);
                        const currentIndex = stepIndices.indexOf(currentStatus);
                        const thisIndex = index;

                        const isCompleted = thisIndex <= currentIndex;
                        const isCurrent = thisIndex === currentIndex;

                        // Find history entry for this step if exists
                        const historyEntry = history.find((h: any) => h.status.toLowerCase() === step.key.toLowerCase());

                        return (
                            <View key={step.key} style={{ flexDirection: 'row', marginBottom: index === steps.length - 1 ? 0 : 24 }}>
                                <View style={{ alignItems: 'center', marginRight: 16 }}>
                                    <View style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: isCompleted ? Colors.primary : Colors.gray200,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        <Icon name={step.icon} size={16} color={isCompleted ? '#fff' : Colors.textSecondary} library="material" />
                                    </View>
                                    {index !== steps.length - 1 && (
                                        <View style={{
                                            width: 2,
                                            flex: 1,
                                            backgroundColor: isCompleted && thisIndex < currentIndex ? Colors.primary : Colors.gray200,
                                            position: 'absolute',
                                            top: 32,
                                            bottom: -24
                                        }} />
                                    )}
                                </View>
                                <View style={{ flex: 1, paddingTop: 4 }}>
                                    <Text style={{ fontSize: 16, fontWeight: isCurrent ? '700' : '500', color: isCompleted ? Colors.textPrimary : Colors.textSecondary }}>
                                        {step.label}
                                    </Text>
                                    {historyEntry && (
                                        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                                            {new Date(historyEntry.timestamp).toLocaleString()}
                                        </Text>
                                    )}
                                    {isCurrent && (
                                        <Text style={{ fontSize: 13, color: Colors.primary, marginTop: 4, fontWeight: '600' }}>
                                            In Progress
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

            </ScrollView>
        </View>
    );
}
