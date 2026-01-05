import { CreateDeliveryPartnerData, DeliveryPartner, deliveryPartnerApi, UpdateDeliveryPartnerData } from '@/api/deliveryPartnerApi';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PartnersScreen() {
  const { logout } = useDeliveryPartner();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password?: string;
    role?: 'delivery_partner';
    isActive?: boolean;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'delivery_partner',
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadPartners = useCallback(async () => {
    try {
      setError('');
      const response = await deliveryPartnerApi.getAllDeliveryPartners();
      if (response.success && response.data) {
        setPartners(response.data);
      } else {
        setError('Failed to load partners');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load partners');
      if (err.message.includes('401') || err.message.includes('token')) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => logout() },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPartners();
  }, [loadPartners]);

  const handleViewPartner = async (partner: DeliveryPartner) => {
    try {
      setActionLoading(true);
      const response = await deliveryPartnerApi.getDeliveryPartnerById(partner._id || partner.id || '');
      if (response.success && response.data) {
        setSelectedPartner(response.data);
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to fetch partner details');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch partner details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPartner = (partner: DeliveryPartner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      email: partner.email,
      role: partner.role,
      isActive: partner.isActive,
    });
    setEditModalVisible(true);
  };

  const handleDeletePartner = (partner: DeliveryPartner) => {
    Alert.alert(
      'Delete Partner',
      `Are you sure you want to delete ${partner.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await deliveryPartnerApi.deleteDeliveryPartner(partner._id || partner.id || '');
              Alert.alert('Success', 'Partner deleted successfully');
              loadPartners();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete partner');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCreatePartner = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'delivery_partner',
    });
    setCreateModalVisible(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setActionLoading(true);
      const data: CreateDeliveryPartnerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'delivery_partner'
      };
      const response = await deliveryPartnerApi.createDeliveryPartner(data);
      if (response.success) {
        Alert.alert('Success', 'Partner created successfully');
        setCreateModalVisible(false);
        loadPartners();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create partner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedPartner) return;

    if (!formData.name || !formData.email) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setActionLoading(true);
      const updateData: UpdateDeliveryPartnerData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };
      const response = await deliveryPartnerApi.updateDeliveryPartner(
        selectedPartner._id || selectedPartner.id || '',
        updateData
      );
      if (response.success) {
        Alert.alert('Success', 'Partner updated successfully');
        setEditModalVisible(false);
        setSelectedPartner(null);
        loadPartners();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update partner');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Professional Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Partner Management</Text>
            <Text style={styles.headerSubtitle}>{partners.length} {partners.length === 1 ? 'Partner' : 'Partners'}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreatePartner}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Icon name="add" size={22} color={Colors.textWhite} library="material" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="error" size={18} color={Colors.error} library="material" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Partners List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {partners.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="people-outline" size={64} color={Colors.textTertiary} library="material" />
              </View>
              <Text style={styles.emptyTitle}>No Partners Found</Text>
              <Text style={styles.emptyText}>Get started by creating your first partner</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreatePartner}
                activeOpacity={0.8}
              >
                <Icon name="add" size={18} color={Colors.textWhite} library="material" />
                <Text style={styles.emptyButtonText}>Create Partner</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {partners.map((partner) => (
                <View key={partner._id || partner.id} style={styles.adminCard}>
                  <View style={styles.adminCardContent}>
                    {/* Partner Avatar */}
                    <View style={styles.adminAvatarAdmin}>
                      <Text style={styles.adminAvatarText}>
                        {partner.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Partner Info */}
                    <View style={styles.adminInfo}>
                      <View style={styles.adminHeader}>
                        <Text style={styles.adminName}>{partner.name}</Text>
                        <View style={styles.roleBadgeAdmin}>
                          <Text style={styles.roleText}>Partner</Text>
                        </View>
                      </View>
                      <View style={styles.adminEmailContainer}>
                        <Icon name="email" size={14} color={Colors.textSecondary} library="material" />
                        <Text style={styles.adminEmail}>{partner.email}</Text>
                      </View>
                      <View style={styles.adminMeta}>
                        <View style={[
                          styles.statusBadge,
                          partner.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
                        ]}>
                          <View style={[
                            styles.statusDot,
                            partner.isActive ? styles.statusDotActive : styles.statusDotInactive
                          ]} />
                          <Text style={styles.statusText}>
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        {partner.createdAt && (
                          <View style={styles.dateContainer}>
                            <Icon name="calendar-today" size={12} color={Colors.textTertiary} library="material" />
                            <Text style={styles.adminDate}>
                              {new Date(partner.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.adminActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleViewPartner(partner)}
                      disabled={actionLoading}
                      activeOpacity={0.7}
                    >
                      <Icon name="visibility" size={18} color={Colors.info} library="material" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditPartner(partner)}
                      disabled={actionLoading}
                      activeOpacity={0.7}
                    >
                      <Icon name="edit" size={18} color={Colors.warning} library="material" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePartner(partner)}
                      disabled={actionLoading}
                      activeOpacity={0.7}
                    >
                      <Icon name="delete" size={18} color={Colors.error} library="material" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* View Partner Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Partner Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} library="material" />
              </TouchableOpacity>
            </View>
            {selectedPartner && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalAvatarContainer}>
                  <View style={styles.adminAvatarAdmin}>
                    <Text style={styles.modalAvatarText}>
                      {selectedPartner.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modalName}>{selectedPartner.name}</Text>
                  <View style={styles.roleBadgeAdmin}>
                    <Text style={styles.modalRoleText}>Partner</Text>
                  </View>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="email" size={18} color={Colors.primary} library="material" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{selectedPartner.email}</Text>
                    </View>
                  </View>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="verified-user" size={18} color={Colors.accent} library="material" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Role</Text>
                      <Text style={styles.detailValue}>Delivery Partner</Text>
                    </View>
                  </View>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon
                        name={selectedPartner.isActive ? 'check-circle' : 'cancel'}
                        size={18}
                        color={selectedPartner.isActive ? Colors.success : Colors.error}
                        library="material"
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[
                        styles.detailValue,
                        selectedPartner.isActive ? styles.detailValueActive : styles.detailValueInactive
                      ]}>
                        {selectedPartner.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  {selectedPartner.createdAt && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="calendar-today" size={18} color={Colors.warning} library="material" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Created</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedPartner.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                  {selectedPartner.updatedAt && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="update" size={18} color={Colors.info} library="material" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Last Updated</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedPartner.updatedAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Partner Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Partner</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} library="material" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={18} color={Colors.textSecondary} library="material" />
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter name"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={18} color={Colors.textSecondary} library="material" />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter email"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.isActive !== false && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, isActive: true })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.isActive !== false && styles.roleOptionTextActive,
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.isActive === false && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, isActive: false })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.isActive === false && styles.roleOptionTextActive,
                    ]}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSubmitEdit}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                {actionLoading ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Partner Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Partner</Text>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} library="material" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={18} color={Colors.textSecondary} library="material" />
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Enter name"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={18} color={Colors.textSecondary} library="material" />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter email"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={18} color={Colors.textSecondary} library="material" />
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Enter password (min 6 characters)"
                    placeholderTextColor={Colors.textTertiary}
                    secureTextEntry
                  />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setCreateModalVisible(false)}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSubmitCreate}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                {actionLoading ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Create Partner</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  listContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    // elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adminCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  adminAvatarAdmin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminInfo: {
    flex: 1,
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleBadgeAdmin: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  adminEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  adminEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  adminMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeActive: {
    backgroundColor: Colors.successLight,
  },
  statusBadgeInactive: {
    backgroundColor: Colors.errorLight,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: Colors.success,
  },
  statusDotInactive: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: 16,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: Colors.infoLight,
  },
  editButton: {
    backgroundColor: Colors.warningLight,
  },
  deleteButton: {
    backgroundColor: Colors.errorLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
    backgroundColor: Colors.gray100,
    borderRadius: 16,
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalRoleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailsContainer: {
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detailValueActive: {
    color: Colors.success,
  },
  detailValueInactive: {
    color: Colors.error,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  roleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleOptionTextActive: {
    color: Colors.primary,
  },
  cancelModalButton: {
    backgroundColor: Colors.gray100,
  },
  cancelModalButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    // elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emptyButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
});
