import { Colors } from '@/constants/colors';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function DeliveryPartnerDashboardRedirect() {
  const { isAuthenticated, isLoading } = useDeliveryPartner();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/delivery-partner/(tabs)/index" />;
}

