import { customerApi } from '@/api/customerApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const sentAt = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - sentAt.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return sentAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function NotificationsScreen() {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async (isRefreshing = false) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await customerApi.getNotifications();
            if (res.success) {
                setNotifications(res.notifications);
                // Mark all notifications as read by saving current time
                const nowStr = new Date().toISOString();
                await AsyncStorage.setItem(`@notification_last_viewed_time_${user?.id || 'guest'}`, nowStr);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [isAuthenticated]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.notificationItem}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                    <Icon name="notifications" size={20} color={Colors.primary} library="material" />
                </View>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.time}>{formatRelativeTime(item.sentAt || item.createdAt)}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Icon name="notifications-none" size={48} color={Colors.gray300} library="material" />
            </View>
            <Text style={styles.emptyTitle}>Inboxes Are Quiet</Text>
            <Text style={styles.emptySubtitle}>You&apos;ll find your latest alerts and offers here once they arrive.</Text>
        </View>
    );

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Inbox</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Icon name="lock" size={48} color={Colors.gray300} library="material" />
                    <Text style={styles.emptyTitle}>Login Required</Text>
                    <Text style={styles.emptySubtitle}>Please login to view your notifications.</Text>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.loginButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbox</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={EmptyState}
                    contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchNotifications(true)}
                            colors={[Colors.primary]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.textWhite,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.textWhite,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
    iconContainer: {
        marginRight: 16,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontWeight: '500',
    },
    message: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    loginButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
        borderRadius: 12,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
