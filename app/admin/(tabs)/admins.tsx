import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';
import { adminApi, Admin, CreateAdminData, UpdateAdminData } from '@/api/adminApi';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminsScreen() {
  const { logout } = useAdmin();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
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
    role?: 'admin' | 'super_admin';
    isActive?: boolean;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadAdmins = useCallback(async () => {
    try {
      setError('');
      const response = await adminApi.getAllAdmins();
      if (response.success && response.data) {
        setAdmins(response.data);
      } else {
        setError('Failed to load admins');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
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
    loadAdmins();
  }, [loadAdmins]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAdmins();
  }, [loadAdmins]);

  const handleViewAdmin = async (admin: Admin) => {
    try {
      setActionLoading(true);
      const response = await adminApi.getAdminById(admin._id || admin.id || '');
      if (response.success && response.data) {
        setSelectedAdmin(response.data);
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to fetch admin details');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch admin details');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });
    setEditModalVisible(true);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    Alert.alert(
      'Delete Admin',
      `Are you sure you want to delete ${admin.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminApi.deleteAdmin(admin._id || admin.id || '');
              Alert.alert('Success', 'Admin deleted successfully');
              loadAdmins();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete admin');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateAdmin = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
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
      const response = await adminApi.createAdmin(formData as CreateAdminData);
      if (response.success) {
        Alert.alert('Success', 'Admin created successfully');
        setCreateModalVisible(false);
        loadAdmins();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedAdmin) return;

    if (!formData.name || !formData.email) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setActionLoading(true);
      const updateData: UpdateAdminData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };
      const response = await adminApi.updateAdmin(
        selectedAdmin._id || selectedAdmin.id || '',
        updateData
      );
      if (response.success) {
        Alert.alert('Success', 'Admin updated successfully');
        setEditModalVisible(false);
        setSelectedAdmin(null);
        loadAdmins();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update admin');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading admins...</Text>
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
            <Text style={styles.headerTitle}>Admin Management</Text>
            <Text style={styles.headerSubtitle}>{admins.length} {admins.length === 1 ? 'Admin' : 'Admins'}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateAdmin}
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

        {/* Admins List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {admins.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="people-outline" size={64} color={Colors.textTertiary} library="material" />
              </View>
              <Text style={styles.emptyTitle}>No Admins Found</Text>
              <Text style={styles.emptyText}>Get started by creating your first admin</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={handleCreateAdmin}
                activeOpacity={0.8}
              >
                <Icon name="add" size={18} color={Colors.textWhite} library="material" />
                <Text style={styles.emptyButtonText}>Create Admin</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {admins.map((admin) => (
                <View key={admin._id || admin.id} style={styles.adminCard}>
                  <View style={styles.adminCardContent}>
                    {/* Admin Avatar */}
                    <View style={[
                      styles.adminAvatar,
                      admin.role === 'super_admin' 
                        ? styles.adminAvatarSuper 
                        : styles.adminAvatarAdmin
                    ]}>
                      <Text style={styles.adminAvatarText}>
                        {admin.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Admin Info */}
                    <View style={styles.adminInfo}>
                      <View style={styles.adminHeader}>
                        <Text style={styles.adminName}>{admin.name}</Text>
                        <View style={[
                          styles.roleBadge,
                          admin.role === 'super_admin' 
                            ? styles.roleBadgeSuper 
                            : styles.roleBadgeAdmin
                        ]}>
                          <Text style={styles.roleText}>
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.adminEmailContainer}>
                        <Icon name="email" size={14} color={Colors.textSecondary} library="material" />
                        <Text style={styles.adminEmail}>{admin.email}</Text>
                      </View>
                      <View style={styles.adminMeta}>
                        <View style={[
                          styles.statusBadge,
                          admin.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
                        ]}>
                          <View style={[
                            styles.statusDot,
                            admin.isActive ? styles.statusDotActive : styles.statusDotInactive
                          ]} />
                          <Text style={styles.statusText}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        {admin.createdAt && (
                          <View style={styles.dateContainer}>
                            <Icon name="calendar-today" size={12} color={Colors.textTertiary} library="material" />
                            <Text style={styles.adminDate}>
                              {new Date(admin.createdAt).toLocaleDateString()}
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
                      onPress={() => handleViewAdmin(admin)}
                      disabled={actionLoading}
                      activeOpacity={0.7}
                    >
                      <Icon name="visibility" size={18} color={Colors.info} library="material" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditAdmin(admin)}
                      disabled={actionLoading}
                      activeOpacity={0.7}
                    >
                      <Icon name="edit" size={18} color={Colors.warning} library="material" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAdmin(admin)}
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

      {/* View Admin Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Details</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={Colors.textPrimary} library="material" />
              </TouchableOpacity>
            </View>
            {selectedAdmin && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalAvatarContainer}>
                  <View style={[
                    styles.modalAvatar,
                    selectedAdmin.role === 'super_admin' 
                      ? styles.adminAvatarSuper 
                      : styles.adminAvatarAdmin
                  ]}>
                    <Text style={styles.modalAvatarText}>
                      {selectedAdmin.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modalName}>{selectedAdmin.name}</Text>
                  <View style={[
                    styles.modalRoleBadge,
                    selectedAdmin.role === 'super_admin' 
                      ? styles.roleBadgeSuper 
                      : styles.roleBadgeAdmin
                  ]}>
                    <Text style={styles.modalRoleText}>
                      {selectedAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="email" size={18} color={Colors.primary} library="material" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{selectedAdmin.email}</Text>
                    </View>
                  </View>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="verified-user" size={18} color={Colors.accent} library="material" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Role</Text>
                      <Text style={styles.detailValue}>
                        {selectedAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Icon 
                        name={selectedAdmin.isActive ? 'check-circle' : 'cancel'} 
                        size={18} 
                        color={selectedAdmin.isActive ? Colors.success : Colors.error} 
                        library="material" 
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[
                        styles.detailValue,
                        selectedAdmin.isActive ? styles.detailValueActive : styles.detailValueInactive
                      ]}>
                        {selectedAdmin.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  {selectedAdmin.createdAt && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="calendar-today" size={18} color={Colors.warning} library="material" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Created</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedAdmin.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                  {selectedAdmin.updatedAt && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="update" size={18} color={Colors.info} library="material" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Last Updated</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedAdmin.updatedAt).toLocaleString()}
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

      {/* Edit Admin Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Admin</Text>
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
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'admin' })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'admin' && styles.roleOptionTextActive,
                    ]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'super_admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'super_admin' })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'super_admin' && styles.roleOptionTextActive,
                    ]}>
                      Super Admin
                    </Text>
                  </TouchableOpacity>
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

      {/* Create Admin Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Admin</Text>
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'admin' })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'admin' && styles.roleOptionTextActive,
                    ]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'super_admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'super_admin' })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'super_admin' && styles.roleOptionTextActive,
                    ]}>
                      Super Admin
                    </Text>
                  </TouchableOpacity>
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
                  <Text style={styles.modalButtonText}>Create Admin</Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listContainer: {
    padding: 20,
    gap: 14,
  },
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  adminCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  adminAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  adminAvatarAdmin: {
    backgroundColor: Colors.primary,
  },
  adminAvatarSuper: {
    backgroundColor: Colors.accent,
  },
  adminAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  adminInfo: {
    flex: 1,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  adminName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    minWidth: 100,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeAdmin: {
    backgroundColor: `${Colors.primary}15`,
  },
  roleBadgeSuper: {
    backgroundColor: `${Colors.accent}15`,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  adminEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  adminMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  statusBadgeActive: {
    backgroundColor: `${Colors.success}15`,
  },
  statusBadgeInactive: {
    backgroundColor: `${Colors.error}15`,
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
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '400',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  viewButton: {},
  editButton: {},
  deleteButton: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  detailsContainer: {
    gap: 10,
  },
  detailCard: {
    flexDirection: 'row',
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: Colors.gray200,
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleOptionTextActive: {
    color: Colors.primary,
  },
});
