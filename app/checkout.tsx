import { orderApi } from '@/api/orderApi';
import { pincodeApi, PincodeOption } from '@/api/pincodeApi';
import { deliverySlotApi } from '@/api/deliverySlotApi';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Address, PaymentMethod } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 375;

const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CheckoutScreen() {
    const { cart, clearCart } = useCart();
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();

    // State
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newStreet, setNewStreet] = useState('');
    const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
    const [pincodes, setPincodes] = useState<PincodeOption[]>([]);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [selectedPincode, setSelectedPincode] = useState<PincodeOption | null>(null);
    const [showPincodeModal, setShowPincodeModal] = useState(false);
    const [pincodeSearch, setPincodeSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Delivery Slots State
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
    const [availabilityInfo, setAvailabilityInfo] = useState<any>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const deliveryDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                value: getLocalDateString(date),
                isToday: i === 0
            });
        }
        return dates;
    }, []);

    // Computed
    const totalGST = useMemo(() => {
        return cart.items.reduce((sum, item) => {
            const gstRate = item.product?.gstRate || 0;
            if (gstRate > 0) {
                const taxable = item.total / (1 + gstRate / 100);
                return sum + (item.total - taxable);
            }
            return sum;
        }, 0);
    }, [cart.items]);

    const activeStep = useMemo(() => {
        if (isAddingAddress) return 1;
        if (!selectedAddressId) return 1;
        return 2;
    }, [isAddingAddress, selectedAddressId]);

    // Effects
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        StatusBar.setBarStyle('dark-content');
    }, []);

    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
            const def = user.addresses.find(a => a.isDefault);
            setSelectedAddressId(def?.id || user.addresses[0].id);
        }
    }, [user?.addresses]);

    useEffect(() => {
        let cancelled = false;
        setPincodeLoading(true);
        pincodeApi.getActivePincodes().then(res => {
            if (!cancelled && res.success) setPincodes(res.data);
        }).finally(() => { if (!cancelled) setPincodeLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredPincodes = useMemo(() => 
        pincodes.filter(p => p.pincode.includes(pincodeSearch)),
    [pincodes, pincodeSearch]);

    useEffect(() => {
        fetchAvailability();
    }, [selectedDate]);

    const fetchAvailability = async () => {
        try {
            setSlotsLoading(true);
            const res = await deliverySlotApi.getAvailability(selectedDate);
            if (res.success) {
                setAvailabilityInfo(res.data);
                const slots = res.data.availableSlots || [];
                setAvailableSlots(slots);
                
                // Determine first available (non-full) slot
                const firstAvailableSlot = slots.find((s: any) => !s.isFull);

                // If today is full and we selected today, switch to tomorrow
                if (res.data.isFull && selectedDate === getLocalDateString(new Date())) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(getLocalDateString(tomorrow));
                    showToast('Orders full for today. Switching to tomorrow.', 'info');
                } else {
                    // Check if current selectedSlot is available and not full in the loaded slots
                    const currentSlotValid = slots.find((s: any) => s.name === selectedSlot && !s.isFull);
                    if (!currentSlotValid) {
                        setSelectedSlot(firstAvailableSlot ? firstAvailableSlot.name : null);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch availability', e);
        } finally {
            setSlotsLoading(false);
        }
    };

    // Handlers
    const handleSaveAddress = async () => {
        if (!newStreet.trim()) return showToast('Please enter your street address', 'info');
        if (!selectedPincode) return showToast('Please select a delivery pincode', 'info');

        const addressToSave: Address = {
            id: Math.random().toString(36).substr(2, 9),
            street: newStreet.trim(),
            city: selectedPincode.city || 'Default City',
            state: selectedPincode.state || 'Default State',
            zip: selectedPincode.pincode,
            type: addressType,
            isDefault: (user?.addresses?.length || 0) === 0,
        };

        if (user) {
            const updatedAddresses = [...(user.addresses || []), addressToSave];
            try {
                const res = await updateProfile({ addresses: updatedAddresses });
                if (res.success) {
                    showToast('Address added successfully', 'success');
                    setSelectedAddressId(addressToSave.id);
                    setIsAddingAddress(false);
                    setNewStreet('');
                    setSelectedPincode(null);
                } else {
                    showToast(res.message || 'Failed to save address', 'error');
                }
            } catch (error) {
                showToast('Failed to save address', 'error');
            }
        }
    };

    const handlePlaceOrder = async () => {
        const addressObject = user?.addresses?.find(a => a.id === selectedAddressId);
        if (!addressObject) return showToast('Please select a delivery address', 'info');

        try {
            setLoading(true);
            const orderData = {
                shippingAddress: {
                    street: addressObject.street,
                    city: addressObject.city || '',
                    state: addressObject.state || '',
                    zip: addressObject.zip,
                    addressType: addressObject.type || 'Home',
                },
                paymentMethod: paymentMethod.toUpperCase(),
                deliveryDate: selectedDate,
                deliverySlot: selectedSlot,
            };

            const res = await orderApi.placeOrder(orderData);
            if (res.success) {
                clearCart();
                router.replace({
                    pathname: '/orders/confirmation',
                    params: {
                        orderId: res.data?._id || `ORD-${Date.now()}`,
                        total: cart.total.toString(),
                    },
                });
            } else {
                showToast(res.message || 'Failed to place order', 'error');
            }
        } catch (error: any) {
            showToast(error.message || 'An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Step Indicator */}
            <View style={styles.stepContainer}>
                {[1, 2].map((step) => (
                    <React.Fragment key={step}>
                        <View style={[styles.stepCircle, activeStep >= step && styles.stepCircleActive]}>
                            <Text style={[styles.stepText, activeStep >= step && styles.stepTextActive]}>{step}</Text>
                        </View>
                        {step === 1 && <View style={[styles.stepLine, activeStep > 1 && styles.stepLineActive]} />}
                    </React.Fragment>
                ))}
                <View style={styles.stepLabels}>
                    <Text style={[styles.stepLabel, activeStep >= 1 && styles.stepLabelActive]}>Address</Text>
                    <Text style={[styles.stepLabel, activeStep >= 2 && styles.stepLabelActive]}>Payment</Text>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    
                    {/* Address Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="location-on" size={20} color={Colors.primary} library="material" />
                            <Text style={styles.cardTitle}>Delivery Address</Text>
                            {!isAddingAddress && user?.addresses && user.addresses.length > 0 && (
                                <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                                    <Text style={styles.editLink}>Change</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {isAddingAddress ? (
                            <View style={styles.addressForm}>
                                <Text style={styles.inputLabel}>HOUSE / FLAT / BLOCK NO.</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full address"
                                    value={newStreet}
                                    onChangeText={setNewStreet}
                                    placeholderTextColor={Colors.textTertiary}
                                />
                                
                                <Text style={styles.inputLabel}>DELIVERY PINCODE</Text>
                                <TouchableOpacity 
                                    style={styles.pincodeButton} 
                                    onPress={() => setShowPincodeModal(true)}
                                >
                                    <Text style={selectedPincode ? styles.pincodeText : styles.pincodePlaceholder}>
                                        {selectedPincode ? selectedPincode.pincode : 'Select Pincode'}
                                    </Text>
                                    <Icon name="chevron-right" size={20} color={Colors.textTertiary} library="material" />
                                </TouchableOpacity>

                                <View style={styles.typeContainer}>
                                    {(['Home', 'Work', 'Other'] as const).map(type => (
                                        <TouchableOpacity 
                                            key={type} 
                                            onPress={() => setAddressType(type)}
                                            style={[styles.typeChip, addressType === type && styles.typeChipActive]}
                                        >
                                            <Text style={[styles.typeChipText, addressType === type && styles.typeChipTextActive]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.formActions}>
                                    <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsAddingAddress(false)}>
                                        <Text style={styles.btnSecondaryText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveAddress}>
                                        <Text style={styles.btnPrimaryText}>Save Address</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                {user?.addresses && user.addresses.length > 0 ? (
                                    <View style={styles.selectedAddress}>
                                        <View style={styles.addressInfo}>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{user?.addresses?.find(a => a.id === selectedAddressId)?.type || 'Home'}</Text>
                                            </View>
                                            <Text style={styles.addressText} numberOfLines={2}>
                                                {user?.addresses?.find(a => a.id === selectedAddressId)?.street}
                                            </Text>
                                            <Text style={styles.zipText}>Pincode: {user?.addresses?.find(a => a.id === selectedAddressId)?.zip}</Text>
                                        </View>
                                        <Icon name="check-circle" size={24} color={Colors.success} library="material" />
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.emptyAddress} onPress={() => setIsAddingAddress(true)}>
                                        <Icon name="add-location-alt" size={32} color={Colors.gray300} library="material" />
                                        <Text style={styles.emptyAddressText}>No address added yet</Text>
                                        <Text style={styles.addLink}>Add New Address</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Delivery Schedule Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="schedule" size={20} color={Colors.primary} library="material" />
                            <Text style={styles.cardTitle}>Delivery Schedule</Text>
                        </View>

                        {/* Date Picker */}
                        <Text style={styles.cardTitleSmall}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
                            {deliveryDates.map((date) => {
                                const d = new Date(date.value);
                                const dayName = date.label === 'Today' ? 'Today' : date.label === 'Tomorrow' ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
                                const dayNum = d.getDate();
                                const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
                                
                                return (
                                    <TouchableOpacity
                                        key={date.value}
                                        onPress={() => setSelectedDate(date.value)}
                                        style={[
                                            styles.premiumDateCard,
                                            selectedDate === date.value && styles.premiumDateCardActive,
                                        ]}
                                    >
                                        <Text style={[styles.premiumDateDay, selectedDate === date.value && styles.premiumDateDayActive]}>{dayName}</Text>
                                        <Text style={[styles.premiumDateNum, selectedDate === date.value && styles.premiumDateNumActive]}>{dayNum}</Text>
                                        <Text style={[styles.premiumDateMonth, selectedDate === date.value && styles.premiumDateMonthActive]}>{monthName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Slot Picker */}
                        <Text style={[styles.cardTitleSmall, { marginTop: 20 }]}>Select Time Window</Text>
                        {slotsLoading ? (
                            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.premiumSlotList}>
                                {availableSlots.length > 0 ? (
                                    availableSlots.map((slot: any) => {
                                        const isSelected = selectedSlot === slot.name;
                                        const isFull = slot.isFull;
                                        
                                        // Pick an icon based on slot name / times
                                        let iconName = 'wb-sunny'; // Default
                                        let iconColor = '#FFA000'; // Amber
                                        
                                        const slotNameLower = slot.name.toLowerCase();
                                        if (slotNameLower.includes('morning') || slot.startTime.localeCompare('12:00') < 0) {
                                            iconName = 'brightness-5'; // sunrise
                                            iconColor = '#FF9800';
                                        } else if (slotNameLower.includes('evening') || slotNameLower.includes('night') || slot.startTime.localeCompare('17:00') >= 0) {
                                            iconName = 'nights-stay'; // evening/moon
                                            iconColor = '#3F51B5';
                                        } else if (slotNameLower.includes('afternoon') || (slot.startTime.localeCompare('12:00') >= 0 && slot.startTime.localeCompare('17:00') < 0)) {
                                            iconName = 'wb-sunny';
                                            iconColor = '#F57C00';
                                        }

                                        // Format slot times nicely to 12-hour AM/PM format
                                        const formatTime12 = (time24: string) => {
                                            if (!time24) return '';
                                            const [hours, minutes] = time24.split(':');
                                            const hr = parseInt(hours, 10);
                                            const ampm = hr >= 12 ? 'PM' : 'AM';
                                            const hr12 = hr % 12 || 12;
                                            return `${hr12}:${minutes} ${ampm}`;
                                        };

                                        const formattedTimeRange = `${formatTime12(slot.startTime)} - ${formatTime12(slot.endTime)}`;

                                        // Calculate slot remaining status if we have the data
                                        const showCapacity = slot.maxOrders && slot.currentOrders !== undefined;
                                        const remaining = showCapacity ? (slot.maxOrders - slot.currentOrders) : 0;
                                        
                                        return (
                                            <TouchableOpacity
                                                key={slot._id}
                                                onPress={() => !isFull && setSelectedSlot(slot.name)}
                                                disabled={isFull}
                                                style={[
                                                    styles.premiumSlotCard,
                                                    isSelected && styles.premiumSlotCardActive,
                                                    isFull && styles.premiumSlotCardDisabled
                                                ]}
                                            >
                                                <View style={styles.premiumSlotLeft}>
                                                    <View style={[
                                                        styles.premiumSlotIconContainer,
                                                        isSelected && styles.premiumSlotIconContainerActive,
                                                        isFull && styles.premiumSlotIconContainerDisabled
                                                    ]}>
                                                        <Icon 
                                                            name={iconName} 
                                                            size={20} 
                                                            color={isFull ? '#9E9E9E' : (isSelected ? Colors.primary : iconColor)} 
                                                            library="material" 
                                                        />
                                                    </View>
                                                    
                                                    <View style={styles.premiumSlotInfo}>
                                                        <Text style={[
                                                            styles.premiumSlotName,
                                                            isSelected && styles.premiumSlotNameActive,
                                                            isFull && styles.premiumSlotNameDisabled
                                                        ]}>
                                                            {slot.name}
                                                        </Text>
                                                        <Text style={[
                                                            styles.premiumSlotTime,
                                                            isSelected && styles.premiumSlotTimeActive,
                                                            isFull && styles.premiumSlotTimeDisabled
                                                        ]}>
                                                            {formattedTimeRange}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.premiumSlotRight}>
                                                    {isFull ? (
                                                        <View style={styles.premiumFullBadge}>
                                                            <Text style={styles.premiumFullBadgeText}>FULL</Text>
                                                        </View>
                                                    ) : (
                                                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                                            <View style={[
                                                                styles.premiumRadio,
                                                                isSelected && styles.premiumRadioActive
                                                            ]}>
                                                                {isSelected && <View style={styles.premiumRadioInner} />}
                                                            </View>
                                                            {showCapacity && remaining <= 5 && remaining > 0 && (
                                                                <Text style={styles.premiumRemainingText}>
                                                                    {remaining} slot{remaining > 1 ? 's' : ''} left
                                                                </Text>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : (
                                    <View style={styles.premiumNoSlotsContainer}>
                                        <Icon name="event-busy" size={40} color={Colors.textTertiary} library="material" />
                                        <Text style={styles.noSlotsText}>No delivery slots available for this date</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {availabilityInfo?.isFull && (
                            <View style={styles.fullWarning}>
                                <Icon name="info-outline" size={16} color="#E65100" library="material" />
                                <Text style={styles.fullWarningText}>This date is fully booked. Please select a future date.</Text>
                            </View>
                        )}
                    </View>

                    {/* Order Items Summary */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="shopping-bag" size={20} color={Colors.primary} library="material" />
                            <Text style={styles.cardTitle}>Order Summary</Text>
                            <Text style={styles.itemCount}>{cart.items.length} Items</Text>
                        </View>
                        <View style={styles.itemList}>
                            {cart.items.map(item => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={styles.dot} />
                                        <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                                        <Text style={styles.itemQty}>x {item.quantity}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>₹{item.total}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bill Details */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitleSmall}>Bill Details</Text>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Item Total</Text>
                            <Text style={styles.billValue}>₹{cart.items.reduce((sum, i) => sum + i.total, 0)}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <View style={styles.rowWithIcon}>
                                <Text style={styles.billLabel}>Delivery Fee</Text>
                                <Icon name="info-outline" size={12} color={Colors.textTertiary} library="material" />
                            </View>
                            <Text style={[styles.billValue, cart.deliveryFee === 0 && { color: Colors.success }]}>
                                {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}
                            </Text>
                        </View>
                        {totalGST > 0 && (
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>GST (Included)</Text>
                                <Text style={styles.billValueSub}>₹{totalGST.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.billDivider} />
                        <View style={styles.billRow}>
                            <Text style={styles.billTotalLabel}>Grand Total</Text>
                            <Text style={styles.billTotalValue}>₹{cart.total}</Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitleSmall}>Choose Payment Method</Text>
                        <View style={styles.paymentOptions}>
                            {[
                                { id: 'cod', label: 'Cash on Delivery', icon: 'payments' },
                                { id: 'upi', label: 'UPI / Google Pay', icon: 'account-balance-wallet' }
                            ].map((method) => (
                                <TouchableOpacity 
                                    key={method.id}
                                    onPress={() => setPaymentMethod(method.id as any)}
                                    style={[styles.paymentOption, paymentMethod === method.id && styles.paymentOptionActive]}
                                >
                                    <Icon name={method.icon} size={22} color={paymentMethod === method.id ? Colors.primary : Colors.textSecondary} library="material" />
                                    <Text style={[styles.paymentText, paymentMethod === method.id && styles.paymentTextActive]}>{method.label}</Text>
                                    <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                                        {paymentMethod === method.id && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.safetyCard}>
                        <Icon name="verified-user" size={20} color={Colors.success} library="material" />
                        <Text style={styles.safetyText}>Secure Checkout | 100% Genuine Products</Text>
                    </View>

                </Animated.View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                    <Text style={styles.totalPrice}>₹{cart.total}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.placeOrderBtn, loading && styles.btnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
                            <Icon name="chevron-right" size={20} color="#fff" library="material" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Address Selection Modal */}
            <Modal visible={showAddressModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Address</Text>
                            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                                <Icon name="close" size={24} color={Colors.textTertiary} library="material" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={{ maxHeight: 400 }}>
                            {user?.addresses?.map((addr) => (
                                <TouchableOpacity 
                                    key={addr.id}
                                    style={[
                                        styles.pincodeRow, 
                                        selectedAddressId === addr.id && { backgroundColor: '#FFF9F4', borderColor: Colors.primary, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10 }
                                    ]}
                                    onPress={() => {
                                        setSelectedAddressId(addr.id);
                                        setShowAddressModal(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{addr.type}</Text>
                                            </View>
                                            {addr.isDefault && <Text style={{ fontSize: 10, color: Colors.success, fontWeight: '800' }}>DEFAULT</Text>}
                                        </View>
                                        <Text style={[styles.addressText, { fontSize: 14 }]} numberOfLines={2}>{addr.street}</Text>
                                        <Text style={styles.zipText}>{addr.city}, {addr.zip}</Text>
                                    </View>
                                    {selectedAddressId === addr.id && <Icon name="check-circle" size={20} color={Colors.primary} library="material" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity 
                            style={[styles.btnPrimary, { marginTop: 16, width: '100%', height: 50, justifyContent: 'center' }]}
                            onPress={() => {
                                setShowAddressModal(false);
                                setIsAddingAddress(true);
                            }}
                        >
                            <Text style={styles.btnPrimaryText}>+ Add New Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Pincode Modal */}
            <Modal visible={showPincodeModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Area</Text>
                            <TouchableOpacity onPress={() => setShowPincodeModal(false)}>
                                <Icon name="close" size={24} color={Colors.textTertiary} library="material" />
                            </TouchableOpacity>
                        </View>
                        <TextInput 
                            style={styles.modalSearch}
                            placeholder="Search pincode..."
                            value={pincodeSearch}
                            onChangeText={setPincodeSearch}
                            keyboardType="numeric"
                        />
                        <FlatList
                            data={filteredPincodes}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.pincodeRow}
                                    onPress={() => {
                                        setSelectedPincode(item);
                                        setShowPincodeModal(false);
                                    }}
                                >
                                    <Text style={styles.pincodeRowText}>{item.pincode}</Text>
                                    <Text style={styles.pincodeRowCity}>{item.city}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const itemNameContainerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    stepContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E9ECEF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    stepCircleActive: {
        backgroundColor: Colors.primary,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    stepTextActive: {
        color: '#fff',
    },
    stepLine: {
        flex: 0.5,
        height: 2,
        backgroundColor: '#E9ECEF',
        marginHorizontal: -2,
        zIndex: 1,
    },
    stepLineActive: {
        backgroundColor: Colors.primary,
    },
    stepLabels: {
        position: 'absolute',
        bottom: 2,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textTertiary,
    },
    stepLabelActive: {
        color: Colors.primary,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F3F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginLeft: 8,
        flex: 1,
    },
    cardTitleSmall: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    editLink: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    selectedAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9F4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE8D6',
    },
    addressInfo: {
        flex: 1,
    },
    badge: {
        backgroundColor: '#FFE8D6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
        lineHeight: 20,
    },
    zipText: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 4,
        fontWeight: '600',
    },
    emptyAddress: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyAddressText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        fontWeight: '600',
    },
    addLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '800',
        marginTop: 4,
    },
    addressForm: {
        marginTop: 8,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textTertiary,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    pincodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    pincodeText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    pincodePlaceholder: {
        fontSize: 14,
        color: Colors.textTertiary,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    typeChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F1F3F5',
        alignItems: 'center',
    },
    typeChipActive: {
        backgroundColor: Colors.primary,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    typeChipTextActive: {
        color: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
    },
    btnSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    btnSecondaryText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    btnPrimary: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnPrimaryText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },
    itemCount: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textTertiary,
    },
    itemList: {
        marginTop: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.success,
        marginRight: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        flexShrink: 1,
    },
    itemQty: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textTertiary,
        marginLeft: 8,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginLeft: 12,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rowWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    billLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    billValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    billValueSub: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textTertiary,
    },
    billDivider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginVertical: 12,
    },
    billTotalLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: Colors.textPrimary,
    },
    billTotalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.primary,
    },
    paymentOptions: {
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F3F5',
        backgroundColor: '#fff',
    },
    paymentOptionActive: {
        borderColor: Colors.primary,
        backgroundColor: '#FFF9F4',
    },
    paymentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginLeft: 12,
    },
    paymentTextActive: {
        color: Colors.textPrimary,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E9ECEF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    safetyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1FBF4',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    safetyText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.success,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textTertiary,
        letterSpacing: 0.5,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.textPrimary,
    },
    placeOrderBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    btnDisabled: {
        backgroundColor: '#DEE2E6',
        shadowOpacity: 0,
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        marginRight: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    modalSearch: {
        backgroundColor: '#F1F3F5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
    },
    pincodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    pincodeRowText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    pincodeRowCity: {
        fontSize: 14,
        color: Colors.textTertiary,
        fontWeight: '600',
    },
    // Delivery Schedule Styles
    dateList: {
        marginBottom: 10,
    },
    dateChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F3F5',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dateChipActive: {
        backgroundColor: '#FFF9F4',
        borderColor: Colors.primary,
    },
    dateChipDisabled: {
        backgroundColor: '#F8F9FA',
        opacity: 0.6,
    },
    dateLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    dateLabelActive: {
        color: Colors.primary,
    },
    dateLabelDisabled: {
        color: Colors.textTertiary,
    },
    fullBadge: {
        fontSize: 8,
        fontWeight: '900',
        color: '#D84315',
        marginTop: 2,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slotChip: {
        width: (width - 64 - 10) / 2, // 2 columns with gaps and padding
        padding: 12,
        borderRadius: 14,
        backgroundColor: '#F1F3F5',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    slotChipActive: {
        backgroundColor: '#FFF9F4',
        borderColor: Colors.primary,
    },
    slotText: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    slotTextActive: {
        color: Colors.primary,
    },
    slotTime: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textTertiary,
    },
    slotTimeActive: {
        color: Colors.primary,
        opacity: 0.8,
    },
    noSlotsText: {
        fontSize: 13,
        color: Colors.textTertiary,
        fontStyle: 'italic',
        textAlign: 'center',
        width: '100%',
        marginVertical: 10,
    },
    fullWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 10,
        marginTop: 16,
        gap: 8,
    },
    fullWarningText: {
        fontSize: 12,
        color: '#E65100',
        fontWeight: '700',
        flex: 1,
    },
    premiumDateCard: {
        width: 80,
        height: 95,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    premiumDateCardActive: {
        backgroundColor: '#FFF9F4',
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 3,
    },
    premiumDateDay: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    premiumDateDayActive: {
        color: Colors.primary,
        fontWeight: '800',
    },
    premiumDateNum: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    premiumDateNumActive: {
        color: Colors.primary,
    },
    premiumDateMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textTertiary,
        textTransform: 'uppercase',
    },
    premiumDateMonthActive: {
        color: Colors.primary,
        fontWeight: '800',
    },
    premiumSlotList: {
        gap: 12,
        marginTop: 4,
    },
    premiumSlotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    premiumSlotCardActive: {
        backgroundColor: '#FFF9F4',
        borderColor: Colors.primary,
    },
    premiumSlotCardDisabled: {
        backgroundColor: '#F1F3F5',
        borderColor: '#E9ECEF',
        opacity: 0.6,
    },
    premiumSlotLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    premiumSlotIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF3E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    premiumSlotIconContainerActive: {
        backgroundColor: '#FFE8D6',
    },
    premiumSlotIconContainerDisabled: {
        backgroundColor: '#E9ECEF',
    },
    premiumSlotInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    premiumSlotName: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    premiumSlotNameActive: {
        color: Colors.primary,
    },
    premiumSlotNameDisabled: {
        color: Colors.textTertiary,
        textDecorationLine: 'line-through',
    },
    premiumSlotTime: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    premiumSlotTimeActive: {
        color: Colors.primary,
        opacity: 0.9,
    },
    premiumSlotTimeDisabled: {
        color: Colors.textTertiary,
    },
    premiumSlotRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    premiumRadio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CED4DA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    premiumRadioActive: {
        borderColor: Colors.primary,
    },
    premiumRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    premiumFullBadge: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    premiumFullBadgeText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#C62828',
    },
    premiumRemainingText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#E65100',
        textTransform: 'uppercase',
    },
    premiumNoSlotsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        borderStyle: 'dashed',
        gap: 8,
    },
});
