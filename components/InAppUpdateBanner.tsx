import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInAppUpdate } from '@/hooks/useInAppUpdate';

export const InAppUpdateBanner: React.FC = () => {
  const {
    isDownloaded,
    isDismissed,
    isDownloading,
    downloadPercentage,
    installUpdate,
    dismissBanner,
  } = useInAppUpdate({ autoCheck: true });

  if (Platform.OS !== 'android') {
    return null;
  }

  // Case 1: Flexible update finished downloading and is ready to install
  if (isDownloaded && !isDismissed) {
    return (
      <View style={styles.floatingContainer}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={20} color="#059669" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Update Ready to Install</Text>
              <Text style={styles.subtitle}>
                A new version of GrocMed has finished downloading. Restart now to apply latest improvements.
              </Text>
            </View>
            <TouchableOpacity
              onPress={dismissBanner}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={dismissBanner}
              style={styles.dismissButton}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissButtonText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={installUpdate}
              style={styles.installButton}
              activeOpacity={0.8}
            >
              <Ionicons name="reload" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.installButtonText}>Restart Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Case 2: Flexible update is currently downloading in background
  if (isDownloading) {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <ActivityIndicator size="small" color="#059669" style={{ marginRight: 10 }} />
          <Text style={styles.progressText}>
            {downloadPercentage > 0
              ? `Downloading update (${downloadPercentage}%)...`
              : 'Downloading update in background...'}
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    justifyContent: 'center',
  },
  installButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    zIndex: 9999,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
