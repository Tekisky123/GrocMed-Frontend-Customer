import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Address } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [pan, setPan] = useState(user?.pan || '');
    const [adhaar, setAdhaar] = useState(user?.adhaar || '');
    const [loading, setLoading] = useState(false);

    // Address State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Address Form State
    const [addrStreet, setAddrStreet] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrState, setAddrState] = useState('');
    const [addrZip, setAddrZip] = useState('');
    const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');

    const openAddressModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setAddrStreet(address.street);
            setAddrCity(address.city);
            setAddrState(address.state);
            setAddrZip(address.zip);
            setAddrType(address.type);
        } else {
            setEditingAddress(null);
            setAddrStreet('');
            setAddrCity('');
            setAddrState('');
            setAddrZip('');
            setAddrType('Home');
        }
        setModalVisible(true);
    };

    const handleSaveAddress = async () => {
        if (!addrStreet || !addrCity || !addrState || !addrZip) {
            showToast('Please fill all address fields', 'error');
            return;
        }

        const newAddress: Address = {
            id: editingAddress?.id || Date.now().toString(),
            street: addrStreet,
            city: addrCity,
            state: addrState,
            zip: addrZip,
            type: addrType,
            isDefault: editingAddress?.isDefault || false
        };

        let updatedAddresses = [...(user?.addresses || [])];
        if (editingAddress) {
            updatedAddresses = updatedAddresses.map(a => a.id === editingAddress.id ? newAddress : a);
        } else {
            updatedAddresses.push(newAddress);
        }

        // Optimistic Update
        setLoading(true);
        try {
            const res = await updateProfile({ addresses: updatedAddresses });
            if (res.success) {
                showToast('Address saved successfully', 'success');
                setModalVisible(false);
            } else {
                showToast('Failed to save address', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        const updatedAddresses = (user?.addresses || []).filter(a => a.id !== id);
        setLoading(true);
        try {
            const res = await updateProfile({ addresses: updatedAddresses });
            if (res.success) {
                showToast('Address deleted', 'success');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateInputs = () => {
        if (!name.trim()) return 'Full Name is required';
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Valid Email is required';
        if (!phone.trim() || !/^\d{10}$/.test(phone)) return 'Valid 10-digit Phone Number is required';

        if (pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
            return 'Invalid PAN Card Number (Format: ABCDE1234F)';
        }

        if (adhaar.trim() && !/^\d{12}$/.test(adhaar)) {
            return 'Invalid Adhaar Number (12 digits required)';
        }

        return null;
    };

    const handleSaveProfile = async () => {
        const error = validateInputs();
        if (error) {
            showToast(error, 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await updateProfile({
                name,
                email,
                phone,
                pan: pan.toUpperCase(),
                adhaar
            });

            if (res.success) {
                showToast('Profile updated successfully', 'success');
                router.back();
            } else {
                showToast(res.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Edit Profile" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={Colors.textTertiary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={Colors.textTertiary}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                style={styles.input}
                                placeholder="Enter 10-digit phone number"
                                keyboardType="phone-pad"
                                maxLength={10}
                                placeholderTextColor={Colors.textTertiary}
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>KYC Documents</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PAN Card Number</Text>
                            <TextInput
                                value={pan}
                                onChangeText={(text) => setPan(text.toUpperCase())}
                                style={styles.input}
                                placeholder="Ex: ABCDE1234F"
                                autoCapitalize="characters"
                                maxLength={10}
                                placeholderTextColor={Colors.textTertiary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Adhaar Number</Text>
                            <TextInput
                                value={adhaar}
                                onChangeText={setAdhaar}
                                style={styles.input}
                                placeholder="Enter 12-digit Adhaar number"
                                keyboardType="number-pad"
                                maxLength={12}
                                placeholderTextColor={Colors.textTertiary}
                            />
                        </View>
                    </View>

                    {/* Addresses Section */}
                    <View style={styles.formSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.sectionTitle}>Saved Addresses</Text>
                            <TouchableOpacity onPress={() => openAddressModal()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="add" size={20} color={Colors.primary} library="material" />
                                <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 14 }}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        {(user?.addresses || []).map((addr, index) => (
                            <View key={index} style={styles.addressCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <Icon
                                            name={addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'work' : 'location-pin'}
                                            size={16}
                                            color={Colors.textPrimary}
                                            library="material"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 }}>
                                            {addr.type}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>
                                            {addr.street}, {addr.city}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>
                                            {addr.state} - {addr.zip}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TouchableOpacity onPress={() => openAddressModal(addr)}>
                                            <Icon name="edit" size={18} color={Colors.textTertiary} library="material" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                                            <Icon name="delete" size={18} color={Colors.error} library="material" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {(user?.addresses || []).length === 0 && (
                            <Text style={{ color: Colors.textTertiary, textAlign: 'center', marginBottom: 10 }}>No addresses saved yet.</Text>
                        )}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.disabledBtn]}
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Address Modal */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Icon name="close" size={24} color={Colors.textSecondary} library="material" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>House No / Street</Text>
                                        <TextInput
                                            value={addrStreet}
                                            onChangeText={setAddrStreet}
                                            style={styles.input}
                                            placeholder="Enter street address"
                                            placeholderTextColor={Colors.textTertiary}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>City</Text>
                                            <TextInput
                                                value={addrCity}
                                                onChangeText={setAddrCity}
                                                style={styles.input}
                                                placeholder="City"
                                                placeholderTextColor={Colors.textTertiary}
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>State</Text>
                                            <TextInput
                                                value={addrState}
                                                onChangeText={setAddrState}
                                                style={styles.input}
                                                placeholder="State"
                                                placeholderTextColor={Colors.textTertiary}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Zip Code</Text>
                                        <TextInput
                                            value={addrZip}
                                            onChangeText={setAddrZip}
                                            style={styles.input}
                                            placeholder="Zip Code"
                                            keyboardType="number-pad"
                                            placeholderTextColor={Colors.textTertiary}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Type</Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            {(['Home', 'Work', 'Other'] as const).map(type => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => setAddrType(type)}
                                                    style={[styles.typeChip, addrType === type && styles.activeTypeChip]}
                                                >
                                                    <Text style={[styles.typeText, addrType === type && styles.activeTypeText]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
                                        <Text style={styles.saveBtnText}>Save Address</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    formSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 16,
        letterSpacing: 0.5
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
        marginLeft: 2
    },
    required: {
        color: Colors.error
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.textPrimary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // elevation: 1
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: Colors.gray100
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        // elevation: 4
    },
    disabledBtn: {
        opacity: 0.7
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5
    },
    // Address Styles
    addressCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
        // elevation: 1
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '80%'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.gray300,
        backgroundColor: Colors.gray50
    },
    activeTypeChip: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary
    },
    typeText: {
        color: Colors.textSecondary,
        fontWeight: '600'
    },
    activeTypeText: {
        color: Colors.primary
    }
});
