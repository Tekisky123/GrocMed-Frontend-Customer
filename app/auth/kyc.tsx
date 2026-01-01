import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';

export default function KYCScreen() {
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Mock KYC submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.back();
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1" style={{ backgroundColor: '#6366f1' }}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-4xl font-bold text-white text-center mb-2">
              KYC Verification
            </Text>
            <Text className="text-lg text-white/80 text-center">
              Optional: Verify your identity for enhanced security
            </Text>
          </View>

          <GlassCard className="w-full">
            <Input
              label="Aadhaar Number (Optional)"
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaar}
              onChangeText={setAadhaar}
              keyboardType="number-pad"
              maxLength={12}
              className="mb-4"
            />
            <Input
              label="PAN Number (Optional)"
              placeholder="Enter PAN number"
              value={pan}
              onChangeText={setPan}
              autoCapitalize="characters"
              maxLength={10}
              className="mb-6"
            />
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
            />
            <Button
              title="Skip for Now"
              variant="ghost"
              onPress={handleSkip}
              className="mt-2"
              fullWidth
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Your information is secure and encrypted. This is optional and can be added later.
            </Text>
          </GlassCard>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

