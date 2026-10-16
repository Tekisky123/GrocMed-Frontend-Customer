import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/contexts/ToastContext';
import { customerApi } from '@/api/customerApi';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  // Step 1: Request OTP | Step 2: Verify OTP | Step 3: Set New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification state from backend
  const [maskedPhone, setMaskedPhone] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number>(2);
  const [sendCount, setSendCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);

  // Loading & Timer
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  // Step 1: Send OTP to WhatsApp
  const handleSendOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      showToast('Please enter your 10-digit registered WhatsApp mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.sendForgotPasswordOtp(cleanPhone);
      if (res.success) {
        showToast(res.message || 'OTP sent to your WhatsApp', 'success');
        setMaskedPhone(res.maskedPhone || cleanPhone);
        setVerifiedPhone(res.phone || cleanPhone);
        setSendCount(res.sendCount || 1);
        setAttemptsLeft(res.attemptsLeft !== undefined ? res.attemptsLeft : 1);
        setIsLimitReached(res.attemptsLeft === 0);
        setTimer(60); // 60s cooldown for resend
        setOtp('');
        setStep(2);
      } else {
        showToast(res.message, 'error');
        if (res.message?.includes('Maximum OTP limit reached')) {
          setIsLimitReached(true);
          setAttemptsLeft(0);
        }
      }
    } catch (err: any) {
      showToast('Network error. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP (Max 2 times)
  const handleResendOtp = async () => {
    if (timer > 0 || attemptsLeft <= 0 || isLimitReached) return;

    setLoading(true);
    try {
      const res = await customerApi.sendForgotPasswordOtp(verifiedPhone || phone);
      if (res.success) {
        showToast('New OTP sent to your WhatsApp', 'success');
        setSendCount(res.sendCount || 2);
        setAttemptsLeft(res.attemptsLeft !== undefined ? res.attemptsLeft : 0);
        setIsLimitReached(res.attemptsLeft === 0);
        setTimer(60);
        setOtp('');
      } else {
        showToast(res.message, 'error');
        if (res.message?.includes('Maximum OTP limit reached')) {
          setIsLimitReached(true);
          setAttemptsLeft(0);
        }
      }
    } catch (err: any) {
      showToast('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      showToast('Please enter the complete 6-digit WhatsApp OTP code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.verifyForgotPasswordOtp(verifiedPhone, cleanOtp);
      if (res.success && res.resetToken) {
        showToast('OTP verified successfully!', 'success');
        setResetToken(res.resetToken);
        setStep(3);
      } else {
        showToast(res.message || 'Invalid OTP code', 'error');
      }
    } catch (err: any) {
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await customerApi.resetPasswordWithToken(verifiedPhone, resetToken, newPassword);
      if (res.success) {
        showToast('Password changed successfully! You can now log in.', 'success');
        setTimeout(() => {
          router.replace('/auth/login');
        }, 800);
      } else {
        showToast(res.message || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderAdminContactDetails = () => (
    <View style={styles.adminContactCard}>
      <View style={styles.adminContactHeader}>
        <View style={styles.errorIconCircle}>
          <Icon name="error" size={22} color="#DC2626" library="material" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.adminContactTitle}>Maximum OTP limit reached</Text>
          <Text style={styles.adminContactText}>
            Please contact administrator for password change.
          </Text>
        </View>
      </View>

      <View style={styles.adminContactActions}>
        <Text style={styles.adminContactSectionLabel}>Administrator Contact Details:</Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('tel:9381078548')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="phone" size={18} color="#1565C0" library="material" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactRowTitle}>Phone Call</Text>
            <Text style={styles.contactRowValue}>+91 9381078548</Text>
          </View>
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>Call</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('https://wa.me/919381078548?text=Hello%20GrocMed%20Admin,%20I%20have%20reached%20the%20maximum%20OTP%20limit%20for%20password%20reset.%20Please%20help%20me%20update%20my%20password.')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: '#E0F2F1' }]}>
            <Icon name="chat" size={18} color="#00695C" library="material" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactRowTitle}>WhatsApp Support</Text>
            <Text style={styles.contactRowValue}>+91 9381078548</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: '#25D36620' }]}>
            <Text style={[styles.actionBadgeText, { color: '#059669' }]}>WhatsApp</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:Info@grocmed.com?subject=Password%20Reset%20Assistance')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="email" size={18} color="#2E7D32" library="material" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactRowTitle}>Email Administrator</Text>
            <Text style={styles.contactRowValue}>Info@grocmed.com</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: '#3B82F620' }]}>
            <Text style={[styles.actionBadgeText, { color: '#2563EB' }]}>Email</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>2</Text>
          </View>
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 3 && styles.stepDotTextActive]}>3</Text>
          </View>
        </View>

        {/* ================= STEP 1: Phone / Account Entry ================= */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name="lock-reset" size={32} color={Colors.primary} library="material" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered WhatsApp mobile number. We will send a 6-digit OTP code directly to your WhatsApp.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp Mobile Number *</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={Colors.textTertiary}
                  value={phone}
                  onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.securityNotice}>
              <Icon name="verified-user" size={18} color={Colors.accent} library="material" />
              <Text style={styles.securityNoticeText}>
                OTP will be delivered securely via WhatsApp. (Maximum 2 requests permitted).
              </Text>
            </View>

            {/* Administrator Contact Details if Limit Reached */}
            {isLimitReached && renderAdminContactDetails()}

            <TouchableOpacity
              style={[styles.primaryButton, (loading || isLimitReached) && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading || isLimitReached}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Send WhatsApp OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 2: WhatsApp OTP Verification ================= */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: '#25D36615' }]}>
              <Icon name="chat" size={30} color="#25D366" library="material" />
            </View>
            <Text style={styles.title}>WhatsApp Verification</Text>
            
            {/* Required explicit text showing registered WhatsApp number */}
            <View style={styles.whatsappNoticeBox}>
              <Text style={styles.whatsappNoticeText}>
                We have sent an OTP to your registered WhatsApp number:
              </Text>
              <Text style={styles.whatsappNumberHighlight}>
                +91 {verifiedPhone || maskedPhone}
              </Text>
            </View>

            {/* Single 6-Digit OTP Input Box */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter 6-Digit Verification Code</Text>
              <TextInput
                style={styles.singleOtpInput}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="------"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
                editable={!loading}
              />
              <Text style={styles.otpHelperText}>
                Enter the 6-digit OTP code received on your WhatsApp
              </Text>
            </View>

            {/* Resend Status & Strict 2 Attempts Rule */}
            <View style={styles.resendRow}>
              {attemptsLeft > 0 ? (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={timer > 0 || loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP via WhatsApp'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.limitReachedText}>
                  Maximum OTP requests reached
                </Text>
              )}

              <View style={styles.attemptBadge}>
                <Text style={styles.attemptBadgeText}>
                  Send {sendCount}/2
                </Text>
              </View>
            </View>

            {/* Prominent Administrator Contact Details when 2 times exceeded */}
            {(attemptsLeft <= 0 || isLimitReached) && renderAdminContactDetails()}

            <TouchableOpacity
              style={[styles.primaryButton, (loading || otp.trim().length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading || otp.trim().length !== 6}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify & Proceed</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryLink}
              onPress={() => setStep(1)}
              disabled={loading}
            >
              <Text style={styles.secondaryLinkText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 3: Create New Password ================= */}
        {step === 3 && (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.success + '15' }]}>
              <Icon name="check-circle" size={32} color={Colors.success} library="material" />
            </View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              WhatsApp OTP verified! Create a new secure password for your account.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min 6 characters"
                  placeholderTextColor={Colors.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={showPassword ? Colors.primary : Colors.textTertiary}
                    library="material"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={showConfirmPassword ? Colors.primary : Colors.textTertiary}
                    library="material"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral,
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gray200,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  whatsappNoticeBox: {
    backgroundColor: '#25D36615',
    borderWidth: 1,
    borderColor: '#25D36630',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 22,
  },
  whatsappNoticeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  whatsappNumberHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
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
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCodeBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  singleOtpInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 10,
    textAlign: 'center',
  },
  otpHelperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
    marginLeft: 4,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '10',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.accentDark,
    lineHeight: 16,
  },
  adminContactCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  adminContactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  errorIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminContactTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  adminContactText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 18,
  },
  adminContactActions: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 10,
  },
  adminContactSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    gap: 12,
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRowTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  contactRowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendDisabled: {
    color: Colors.textTertiary,
  },
  limitReachedText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  attemptBadge: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attemptBadgeText: {
    color: Colors.neutral,
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: Colors.neutral,
    fontSize: 14,
    fontWeight: '600',
  },
});
