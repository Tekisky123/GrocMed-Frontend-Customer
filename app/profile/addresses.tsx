import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Icon, Icons } from '@/components/ui/Icon';
import { Address } from '@/types';
import { Colors } from '@/constants/colors';

export default function AddressesScreen() {
  const { user, updateUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  const handleSaveAddress = () => {
    if (user) {
      const newAddress: Address = {
        id: `a-${Date.now()}`,
        ...formData,
        name: formData.name || '',
        phone: formData.phone || '',
        addressLine1: formData.addressLine1 || '',
        city: formData.city || '',
        state: formData.state || '',
        pincode: formData.pincode || '',
        isDefault: formData.isDefault || false,
      } as Address;

      updateUser({
        addresses: [...user.addresses, newAddress],
      });
      setShowAddForm(false);
      setFormData({
        type: 'home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false,
      });
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

      {showAddForm ? (
        <ScrollView className="flex-1 px-4 py-6">
          <GlassCard>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Add New Address
            </Text>
            <Input
              label="Name"
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="mb-4"
            />
            <Input
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              className="mb-4"
            />
            <Input
              label="Address Line 1"
              placeholder="Enter address"
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
              className="mb-4"
            />
            <Input
              label="Address Line 2 (Optional)"
              placeholder="Apartment, suite, etc."
              value={formData.addressLine2}
              onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
              className="mb-4"
            />
            <Input
              label="City"
              placeholder="Enter city"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              className="mb-4"
            />
            <Input
              label="State"
              placeholder="Enter state"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              className="mb-4"
            />
            <Input
              label="Pincode"
              placeholder="Enter pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="number-pad"
              maxLength={6}
              className="mb-4"
            />
            <Button
              title="Save Address"
              onPress={handleSaveAddress}
              fullWidth
              className="mb-2"
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowAddForm(false)}
              fullWidth
            />
          </GlassCard>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {user?.addresses.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <View className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-6 mb-4">
                <Icon name={Icons.location.name} size={64} color="#3b82f6" library={Icons.location.library} />
              </View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No addresses saved
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Add an address to get started
              </Text>
              <Button
                title="Add Address"
                onPress={() => setShowAddForm(true)}
                fullWidth
              />
            </View>
          ) : (
            user?.addresses.map((address) => (
              <GlassCard key={address.id} className="mb-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {address.name}
                      </Text>
                      {address.isDefault && (
                        <View className="bg-blue-500 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: {address.phone}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      // Handle edit
                    }}
                    className="flex-1 flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg"
                  >
                    <Icon name={Icons.edit.name} size={16} color="#3b82f6" library={Icons.edit.library} />
                    <Text className="text-blue-500 font-semibold ml-1">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (user) {
                        updateUser({
                          addresses: user.addresses.filter((a) => a.id !== address.id),
                        });
                      }
                    }}
                    className="flex-1 flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg"
                  >
                    <Icon name={Icons.delete.name} size={16} color="#ef4444" library={Icons.delete.library} />
                    <Text className="text-red-500 font-semibold ml-1">Delete</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

