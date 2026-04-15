import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Address } from '@/types';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const inputStyle = {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#fff',
};

const labelStyle = {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
};

export default function AddressesScreen() {
    const { user, updateProfile } = useAuth();
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Address>>({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        zip: '',
        isDefault: false,
    });

    const handleSaveAddress = async () => {
        if (!formData.street || !formData.city || !formData.state || !formData.zip) {
            return;
        }

        const newAddress: Address = {
            id: `a-${Date.now()}`,
            street: formData.street || '',
            city: formData.city || '',
            state: formData.state || '',
            zip: formData.zip || '',
            type: (formData.type as 'Home' | 'Work' | 'Other') || 'Home',
            isDefault: formData.isDefault || false,
        };

        setSaving(true);
        try {
            // Persist to server via updateProfile
            const updatedAddresses = [...(user?.addresses || []), newAddress];
            await updateProfile({ addresses: updatedAddresses });
            setShowAddForm(false);
            setFormData({ type: 'Home', street: '', city: '', state: '', zip: '', isDefault: false });
        } catch (e) {
            console.error('Save address error', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        const updatedAddresses = (user?.addresses || []).filter(a => a.id !== addressId);
        try {
            await updateProfile({ addresses: updatedAddresses });
        } catch (e) {
            console.error('Delete address error', e);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <PageHeader
                title="My Addresses"
                variant="primary"
                rightComponent={
                    <TouchableOpacity
                        onPress={() => setShowAddForm(true)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        activeOpacity={0.8}
                    >
                        <Icon name={Icons.add.name} size={18} color={Colors.textWhite} library={Icons.add.library} />
                        <Text style={{ color: Colors.textWhite, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                            Add
                        </Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Add Address Form */}
                {showAddForm && (
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.gray100 }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 }}>
                            New Address
                        </Text>

                        <Text style={labelStyle}>Street Address *</Text>
                        <TextInput
                            placeholder="Building, street, area"
                            value={formData.street}
                            onChangeText={(t) => setFormData(prev => ({ ...prev, street: t }))}
                            style={inputStyle}
                        />

                        <Text style={labelStyle}>City *</Text>
                        <TextInput
                            placeholder="City"
                            value={formData.city}
                            onChangeText={(t) => setFormData(prev => ({ ...prev, city: t }))}
                            style={inputStyle}
                        />

                        <Text style={labelStyle}>State *</Text>
                        <TextInput
                            placeholder="State"
                            value={formData.state}
                            onChangeText={(t) => setFormData(prev => ({ ...prev, state: t }))}
                            style={inputStyle}
                        />

                        <Text style={labelStyle}>Pincode *</Text>
                        <TextInput
                            placeholder="6-digit pincode"
                            value={formData.zip}
                            onChangeText={(t) => setFormData(prev => ({ ...prev, zip: t.replace(/\D/g, '').slice(0, 6) }))}
                            keyboardType="numeric"
                            maxLength={6}
                            style={inputStyle}
                        />

                        {/* Address Type */}
                        <Text style={labelStyle}>Address Type</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            {(['Home', 'Work', 'Other'] as const).map(type => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        alignItems: 'center',
                                        borderRadius: 8,
                                        backgroundColor: formData.type === type ? Colors.primary : Colors.gray100,
                                        borderWidth: 1,
                                        borderColor: formData.type === type ? Colors.primary : Colors.gray200,
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: formData.type === type ? '#fff' : Colors.textSecondary }}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddForm(false);
                                    setFormData({ type: 'Home', street: '', city: '', state: '', zip: '', isDefault: false });
                                }}
                                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.gray200 }}
                            >
                                <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveAddress}
                                disabled={saving}
                                style={{ flex: 1, backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' }}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Address List */}
                {!user?.addresses || user.addresses.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <Icon name={Icons.location.name} size={40} color={Colors.gray400} library={Icons.location.library} />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 }}>
                            No Addresses Saved
                        </Text>
                        <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
                            Add an address to get started
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowAddForm(true)}
                            style={{ backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    user.addresses.map(address => (
                        <View
                            key={address.id}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 14,
                                borderWidth: 1,
                                borderColor: address.isDefault ? Colors.primary : Colors.gray100,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 6,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ backgroundColor: Colors.gray100, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' }}>
                                            {address.type}
                                        </Text>
                                    </View>
                                    {address.isDefault && (
                                        <View style={{ backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>Default</Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeleteAddress(address.id)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon name={Icons.delete.name} size={18} color={Colors.error} library={Icons.delete.library} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', lineHeight: 20 }}>
                                {address.street}
                            </Text>
                            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 2 }}>
                                {address.city}, {address.state} - {address.zip}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
