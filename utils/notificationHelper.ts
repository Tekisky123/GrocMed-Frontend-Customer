import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';

let messaging: any;

try {
    messaging = require('@react-native-firebase/messaging').default;
    
    // Mount Killed-State Background Handler Outside React Component Lifecycle
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
        console.log('Background FCM Message Received:', remoteMessage);
        // Note: Expo handled notifications display automatically if correctly formatted.
        // Complex background sync operations can go here.
    });
} catch (error) {
    console.log('Firebase messaging not available (running in Expo Go?):', error);
    messaging = null;
}

export async function requestUserPermission(shouldPrompt = true) {
    if (!messaging) {
        // Expo Go / Managed fallback
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // If not granted, and we should prompt (e.g. after login explaining value)
            if (existingStatus !== 'granted' && shouldPrompt) {
                // Show a polite pre-alert if undetermined (or if denied previously but we want to try)
                // Actually, if denied, we might need to link to settings.
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            return finalStatus === 'granted';
        } catch (error) {
            console.warn('Expo permission request failed:', error);
            return false;
        }
    }

    // Native Logic
    if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    }

    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
            const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    }
    return true;
}

// Intelligent Prompt: Explains WHY before asking.
export async function ensureNotificationPermission() {
    const hasPermission = await requestUserPermission(false); // Check without prompting first

    if (!hasPermission) {
        return new Promise<boolean>((resolve) => {
            Alert.alert(
                "Enable Notifications? 🔔",
                "Stay updated on your order status and delivery updates! We won't spam you.",
                [
                    {
                        text: "Maybe Later",
                        style: "cancel",
                        onPress: () => resolve(false)
                    },
                    {
                        text: "Enable",
                        onPress: async () => {
                            const granted = await requestUserPermission(true);
                            if (!granted) {
                                // If still denied (e.g. permanently denied), ask to open settings
                                Alert.alert(
                                    "Notifications Blocked",
                                    "It looks like notifications are disabled in settings. Please enable them to receive order updates.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Open Settings", onPress: () => {
                                                if (Platform.OS === 'ios') Linking.openURL('app-settings:');
                                                else Linking.openSettings();
                                            }
                                        }
                                    ]
                                );
                            }
                            resolve(granted);
                        }
                    }
                ]
            );
        });
    }
    return true;
}

export async function getFCMToken() {
    try {
        // Use Expo Push Token for reliability in Expo environment
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || "7a31d9b9-c599-43cd-8a2d-0a88b851171c";
        const { data: token } = await Notifications.getExpoPushTokenAsync({
            projectId
            // If projectId is missing in app.json, this might throw in EAS build, but works locally/Standard Expo Go
        });

        console.log('Expo Push Token retrieved:', token);
        return token;
    } catch (error) {
        console.error('Failed to get Expo Push Token:', error);

        // Fallback to Firebase native if Expo fails (for raw native builds)
        if (messaging) {
            try {
                const fcmToken = await messaging().getToken();
                console.log('Fallback Native FCM Token:', fcmToken);
                return fcmToken;
            } catch (nativeError) {
                console.error('Native FCM fallback failed:', nativeError);
            }
        }

        return null;
    }
}

// Configure Expo Notifications to show alerts even when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function testLocalNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Test Notification",
            body: "This is a local test notification to verify permissions.",
            data: { orderId: '123' },
        },
        trigger: null, // Send immediately
    });
}

export function setupNotificationListeners(onNotificationAction?: (payload: any) => void) {
    if (!messaging) {
        console.log('Skipping Firebase listeners in Expo Go');

        // Listen to Expo local notifications (background/foreground interaction)
        const sub1 = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data && onNotificationAction) {
                onNotificationAction(data);
            }
        });

        return () => {
            sub1.remove();
        };
    };

    // Foreground handling
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
        Alert.alert(
            remoteMessage.notification?.title || 'New Notification',
            remoteMessage.notification?.body || 'You have a new message'
        );
    });

    // Background handling
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
        console.log('Notification caused app to open from background state:', remoteMessage);
        if (remoteMessage.data && onNotificationAction) {
            onNotificationAction(remoteMessage.data);
        }
    });

    // Quit state
    messaging()
        .getInitialNotification()
        .then((remoteMessage: any) => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage);
                if (remoteMessage.data && onNotificationAction) {
                    onNotificationAction(remoteMessage.data);
                }
            }
        });

    return unsubscribe;
}
