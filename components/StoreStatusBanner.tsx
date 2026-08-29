import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreStatus } from '@/api/settingApi';

interface StoreStatusBannerProps {
  storeStatus?: StoreStatus;
  compact?: boolean;
}

export const StoreStatusBanner: React.FC<StoreStatusBannerProps> = ({ storeStatus, compact = false }) => {
  if (!storeStatus || storeStatus.isOpen) {
    return null;
  }

  const isEmergency = storeStatus.isEmergencyClosed;
  const message = storeStatus.statusMessage || (isEmergency ? 'Store is currently closed for maintenance' : 'Store is currently closed');

  return (
    <View style={[styles.container, isEmergency ? styles.emergencyContainer : styles.closedContainer]}>
      <View style={styles.iconWrapper}>
        <Ionicons 
          name={isEmergency ? "warning" : "time"} 
          size={compact ? 18 : 22} 
          color={isEmergency ? "#B91C1C" : "#D97706"} 
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.title, isEmergency ? styles.emergencyText : styles.closedText]}>
          {isEmergency ? 'Store Temporarily Closed' : 'Store Currently Closed'}
        </Text>
        <Text style={[styles.subtitle, isEmergency ? styles.emergencySubtext : styles.closedSubtext]}>
          {message}
        </Text>
        {storeStatus.nextOpenTime && !isEmergency && (
          <View style={styles.badge}>
            <Ionicons name="alarm-outline" size={12} color="#92400E" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Opens {storeStatus.nextOpenTime}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  emergencyContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  closedContainer: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  iconWrapper: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  emergencyText: {
    color: '#991B1B',
  },
  emergencySubtext: {
    color: '#7F1D1D',
  },
  closedText: {
    color: '#92400E',
  },
  closedSubtext: {
    color: '#78350F',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#FCD34D',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
  },
});
export default StoreStatusBanner;
