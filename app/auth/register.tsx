import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // B2B Fields
  const [shopName, setShopName] = useState('');
  const [adhaar, setAdhaar] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [adhaarImage, setAdhaarImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  const pickImage = async (type: 'adhaar' | 'license') => {
    console.log(`[ImagePicker] Requesting media library permissions for picking ${type} image...`);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[ImagePicker] Permission result:', permissionResult);
    
    if (!permissionResult.granted) {
      showToast('Permission to access camera roll is required to upload documents.', 'error');
      return;
    }

    console.log('[ImagePicker] Launching image library...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    console.log('[ImagePicker] Selection result canceled:', result.canceled);
    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log(`[ImagePicker] Selected ${type} image URI:`, selectedUri);
      if (type === 'adhaar') setAdhaarImage(selectedUri);
      else setLicenseImage(selectedUri);
    }
  };

  const handleRegister = async () => {
    // Basic validations - Aadhaar and Personal details are mandatory
    if (!name || !email || !phone || !password || !shopName || !adhaar || !adhaarImage) {
      showToast('Please fill all mandatory fields and upload Aadhaar', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('[Register] Preparing FormData...');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('shopName', shopName);
      formData.append('adhaar', adhaar);
      
      // Optional fields
      if (licenseNumber) formData.append('licenseNumber', licenseNumber);

      // Helper to append file correctly for Web vs Mobile
      const appendFile = async (fieldName: string, uri: string, defaultName: string) => {
        if (Platform.OS === 'web') {
          console.log(`[Register] Processing file upload for Web field [${fieldName}]...`);
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = uri.split('/').pop() || defaultName;
            // Native browser File object
            const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
            formData.append(fieldName, file);
            console.log(`[Register] Appended real File on Web: ${filename} (${blob.type})`);
          } catch (e) {
            console.error(`[Register] Error converting file on Web:`, e);
            formData.append(fieldName, uri); // fallback
          }
        } else {
          console.log(`[Register] Processing file upload for Mobile field [${fieldName}]...`);
          const filename = uri.split('/').pop() || defaultName;
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : `image/jpeg`;
          
          const fileObject = {
            uri: uri,
            name: filename,
            type: fileType,
          };
          console.log(`[Register] Appended React Native file object:`, fileObject);
          // @ts-ignore
          formData.append(fieldName, fileObject);
        }
      };

      // Append files asynchronously
      await appendFile('adhaarImage', adhaarImage, 'adhaar.jpg');
      if (licenseImage) {
        await appendFile('licenseImage', licenseImage, 'license.jpg');
      }

      // Log the full FormData structure in React Native
      // @ts-ignore
      if (formData._parts) {
        // @ts-ignore
        console.log('[Register] FormData parts payload:', JSON.stringify(formData._parts, null, 2));
      } else {
        console.log('[Register] FormData object constructed.');
      }

      console.log('[Register] Sending payload to auth registration...');
      const res = await register(formData);
      console.log('[Register] Received registration response:', res);
      if (res.success) {
        showToast('Registration successful! Please login.', 'success');
        router.replace('/auth/login');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join GrocMed for fast delivery</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={styles.input}
              placeholder="GrocMed Store"
              placeholderTextColor={Colors.textTertiary}
              value={shopName}
              onChangeText={setShopName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={Colors.textTertiary}
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhaar Number (Mandatory)</Text>
            <TextInput
              style={styles.input}
              placeholder="12-digit Aadhaar"
              placeholderTextColor={Colors.textTertiary}
              value={adhaar}
              onChangeText={(text) => setAdhaar(text.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={12}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop License / GST Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="License or GST Registration"
              placeholderTextColor={Colors.textTertiary}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.docUploadRow}>
            <TouchableOpacity 
              style={[styles.docButton, adhaarImage && styles.docButtonActive]} 
              onPress={() => pickImage('adhaar')}
            >
              <Icon name={adhaarImage ? "check-circle" : "file-upload"} size={20} color={adhaarImage ? Colors.success : Colors.primary} library="material" />
              <Text style={[styles.docButtonText, adhaarImage && styles.docButtonTextActive]}>{adhaarImage ? "Aadhaar (Required)" : "Upload Aadhaar"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.docButton, licenseImage && styles.docButtonActive]} 
              onPress={() => pickImage('license')}
            >
              <Icon name={licenseImage ? "check-circle" : "file-upload"} size={20} color={licenseImage ? Colors.success : Colors.primary} library="material" />
              <Text style={[styles.docButtonText, licenseImage && styles.docButtonTextActive]}>{licenseImage ? "License (Added)" : "Upload License (Opt)"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative / Info Section */}
          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <View style={{
              backgroundColor: Colors.primary + '15',
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon name="person-add" size={32} color={Colors.primary} library="material" />
            </View>
            <Text style={{ textAlign: 'center', color: Colors.textSecondary, maxWidth: 280, lineHeight: 20, fontSize: 13 }}>
              Join thousands of customers getting their groceries delivered with GrocMed.
            </Text>
          </View>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 110,
    height: 45,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  docUploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  docButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  docButtonActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
    borderStyle: 'solid',
  },
  docButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  docButtonTextActive: {
    color: Colors.success,
  },
});
