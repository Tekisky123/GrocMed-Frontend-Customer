import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreStatus } from '@/api/settingApi';

interface StoreStatusModalProps {
  storeStatus?: StoreStatus;
}

export const StoreStatusModal: React.FC<StoreStatusModalProps> = ({ storeStatus }) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reset dismissal when store status changes to closed
    if (storeStatus && !storeStatus.isOpen) {
      setDismissed(false);
    }
  }, [storeStatus?.isOpen, storeStatus?.statusMessage]);

  if (!storeStatus || storeStatus.isOpen || dismissed) {
    return null;
  }

  const isEmergency = storeStatus.isEmergencyClosed;
  const message = storeStatus.statusMessage || (isEmergency ? 'Store is temporarily closed for maintenance' : 'Store is currently closed');

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!dismissed && !storeStatus.isOpen}
      onRequestClose={() => setDismissed(true)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Decorative Icon Container */}
          <View style={[styles.iconCircle, isEmergency ? styles.emergencyIconBg : styles.closedIconBg]}>
            <Ionicons
              name={isEmergency ? "warning-outline" : "time-outline"}
              size={40}
              color={isEmergency ? "#DC2626" : "#D97706"}
            />
          </View>

          {/* Header Title */}
          <Text style={styles.title}>
            {isEmergency ? 'Store Temporarily Closed' : 'Store Currently Closed'}
          </Text>

          {/* Description Message */}
          <Text style={styles.message}>{message}</Text>

          <Text style={styles.noticeSubtext}>
            You can browse products, but order placement is currently paused until opening hours.
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, isEmergency ? styles.emergencyBtn : styles.closedBtn]}
            onPress={() => setDismissed(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Got It, Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emergencyIconBg: {
    backgroundColor: '#FEF2F2',
  },
  closedIconBg: {
    backgroundColor: '#FFFBEB',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  timingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
  },
  noticeSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBtn: {
    backgroundColor: '#F97316',
  },
  emergencyBtn: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default StoreStatusModal;
