// Web/Mock implementation for Notification Helper

export async function requestUserPermission() {
    console.log('Notification permission request not supported on Web/Expo Go standard client');
    return false;
}

export async function getFCMToken() {
    console.log('FCM Token retrieval not supported on Web/Expo Go standard client');
    return null;
}

export function setupNotificationListeners(onOrderClick?: (orderId: string) => void) {
    console.log('Notification listeners not supported on Web/Expo Go standard client');
    return () => { };
}
