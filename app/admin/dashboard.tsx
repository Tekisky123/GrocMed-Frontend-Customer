import { Redirect } from 'expo-router';
import { useAdmin } from '@/contexts/AdminContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/colors';

export default function AdminDashboardRedirect() {
  const { isAuthenticated, isLoading } = useAdmin();

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

  return <Redirect href="/admin/(tabs)" />;
}

