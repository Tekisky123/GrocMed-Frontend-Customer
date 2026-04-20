import { orderApi } from '@/api/orderApi';
import { pincodeApi, PincodeOption } from '@/api/pincodeApi';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Address, PaymentMethod } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const SECTION_PADDING = 20;

export default function CheckoutScreen() {
    const { cart, clearCart } = useCart();
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();

    const totalGST = cart.items.reduce((sum, item) => {
        const gstRate = item.product?.gstRate || 0;
        if (gstRate > 0) {
            const taxable = item.total / (1 + gstRate / 100);
            return sum + (item.total - taxable);
        }
        return sum;
    }, 0);

    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

    // Address form
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newStreet, setNewStreet] = useState('');
    const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

    // Pincode selection
    const [pincodes, setPincodes] = useState<PincodeOption[]>([]);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [selectedPincode, setSelectedPincode] = useState<PincodeOption | null>(null);
    const [showPincodeModal, setShowPincodeModal] = useState(false);
    const [pincodeSearch, setPincodeSearch] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);

    // Fade in
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    // Auto-select default address
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
            const def = user.addresses.find(a => a.isDefault);
            setSelectedAddressId(def?.id || user.addresses[0].id);
        }
    }, [user?.addresses?.length]);

    // Fetch pincodes
    useEffect(() => {
        let cancelled = false;
        setPincodeLoading(true);
        pincodeApi.getActivePincodes().then(res => {
            if (!cancelled && res.success) setPincodes(res.data);
        }).finally(() => { if (!cancelled) setPincodeLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredPincodes = pincodes.filter(p =>
        p.pincode.includes(pincodeSearch)
    );

    // ── Save new address ──────────────────────────────────────────────────────
    const handleSaveAddress = async () => {
        if (!newStreet.trim()) {
            showToast('Please enter your street address', 'info');
            return;
        }
        if (!selectedPincode) {
            showToast('Please select a delivery pincode', 'info');
            return;
        }

        const addressToSave: Address = {
            id: Math.random().toString(36).substr(2, 9),
            street: newStreet.trim(),
            city: '',
            state: '',
            zip: selectedPincode.pincode,
            type: addressType,
            isDefault: (user?.addresses?.length || 0) === 0,
        };

        if (user) {
            const updatedAddresses = [...(user.addresses || []), addressToSave];
            try {
                await updateProfile({ addresses: updatedAddresses });
            } catch {}
            setSelectedAddressId(addressToSave.id);
        }

        setIsAddingAddress(false);
        setNewStreet('');
        setSelectedPincode(null);
        setAddressType('Home');
        setPincodeSearch('');
    };

    // ── Place order ───────────────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        const addressObject = user?.addresses?.find(a => a.id === selectedAddressId);
        if (!addressObject) {
            showToast('Please select or add a delivery address', 'info');
            return;
        }

        const invalidItems = cart.items.filter(item => {
            const minQty = item.product?.minQuantity || 1;
            return item.quantity < minQty;
        });
        if (invalidItems.length > 0) {
            const names = invalidItems.map(i => i.product.name).join(', ');
            showToast(`Some items are below minimum quantity: ${names}`, 'error');
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                shippingAddress: JSON.stringify({
                    streetAddress: addressObject.street,
                    city: addressObject.city || '',
                    state: addressObject.state || '',
                    postalCode: addressObject.zip,
                    fullName: user?.name || 'Guest',
                    phoneNumber: user?.phone || '',
                }),
                paymentMethod: paymentMethod.toUpperCase(),
                items: cart.items,
                totalAmount: cart.total,
            };

            const res = await orderApi.placeOrder(orderData);
            if (res.success) {
                clearCart();
                router.replace({
                    pathname: '/orders/confirmation',
                    params: {
                        orderId: res.data?.orderId || res.data?._id || `ORD-${Date.now()}`,
                        total: cart.total.toString(),
                    },
                });
            } else {
                showToast(res.message || 'Failed to place order', 'error');
            }
        } catch (error) {
            console.error('Place order error:', error);
            showToast('An error occurred while placing order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const headerHeight = Platform.OS === 'ios' ? 120 : 100;

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <PageHeader title="Checkout" variant="primary" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 120 }}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── Delivery Address ──────────────────────────────────── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>

                        {/* Saved addresses */}
                        {!isAddingAddress && user?.addresses?.map(address => (
                            <TouchableOpacity
                                key={address.id}
                                onPress={() => setSelectedAddressId(address.id)}
                                activeOpacity={0.8}
                                style={[
                                    styles.addressCard,
                                    selectedAddressId === address.id && styles.addressCardSelected,
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText}>{address.type}</Text>
                                        </View>
                                        <Text style={styles.addressZip}>📍 {address.zip}</Text>
                                    </View>
                                    <Text style={styles.addressStreet}>{address.street}</Text>
                                </View>
                                {selectedAddressId === address.id && (
                                    <View style={styles.checkBadge}>
                                        <Icon name="check" size={16} color="#fff" library="material" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}

                        {/* Add address button */}
                        {!isAddingAddress && (
                            <TouchableOpacity
                                onPress={() => setIsAddingAddress(true)}
                                style={styles.addAddressButton}
                            >
                                <Icon name="add" size={20} color={Colors.primary} library="material" />
                                <Text style={styles.addAddressText}>Add New Address</Text>
                            </TouchableOpacity>
                        )}

                        {/* ── New Address Form ──────────────────────────────── */}
                        {isAddingAddress && (
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>New Address Details</Text>

                                {/* Street */}
                                <Text style={styles.fieldLabel}>Street / Building / Area *</Text>
                                <TextInput
                                    placeholder="e.g. 12B, Rose Garden Apartments, MG Road"
                                    value={newStreet}
                                    onChangeText={setNewStreet}
                                    multiline
                                    numberOfLines={2}
                                    style={styles.textInput}
                                    placeholderTextColor={Colors.textTertiary}
                                />

                                {/* Pincode Selector */}
                                <Text style={styles.fieldLabel}>Delivery Pincode *</Text>
                                <TouchableOpacity
                                    onPress={() => setShowPincodeModal(true)}
                                    style={[
                                        styles.pincodeSelector,
                                        selectedPincode ? styles.pincodeSelectorSelected : null,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ flex: 1 }}>
                                        {selectedPincode ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.pincodeSelectorValue}>
                                                    {selectedPincode.pincode}
                                                </Text>
                                                <Icon name="check-circle" size={16} color={Colors.primary} library="material" />
                                            </View>
                                        ) : (
                                            <Text style={styles.pincodeSelectorPlaceholder}>
                                                {pincodeLoading ? 'Loading...' : 'Tap to select pincode →'}
                                            </Text>
                                        )}
                                    </View>
                                    <Icon name="expand-more" size={20} color={Colors.textTertiary} library="material" />
                                </TouchableOpacity>

                                {/* Delivery note callout */}
                                {selectedPincode?.deliveryNote ? (
                                    <View style={styles.deliveryNoteBox}>
                                        <Icon name="info" size={14} color={Colors.info} library="material" />
                                        <Text style={styles.deliveryNoteText}>{selectedPincode.deliveryNote}</Text>
                                    </View>
                                ) : null}

                                {/* Address Type */}
                                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Address Type</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                    {(['Home', 'Work', 'Other'] as const).map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setAddressType(type)}
                                            style={[
                                                styles.typeChip,
                                                addressType === type && styles.typeChipSelected,
                                            ]}
                                        >
                                            <Text style={[
                                                styles.typeChipText,
                                                addressType === type && styles.typeChipTextSelected,
                                            ]}>
                                                {type === 'Home' ? '🏠' : type === 'Work' ? '🏢' : '📍'} {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Form buttons */}
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsAddingAddress(false);
                                            setSelectedPincode(null);
                                            setNewStreet('');
                                            setPincodeSearch('');
                                        }}
                                        style={styles.cancelButton}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveAddress} style={styles.saveButton}>
                                        <Text style={styles.saveButtonText}>Save & Select</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Order Summary ─────────────────────────────────────── */}
                    <View style={[styles.section, { paddingTop: 0 }]}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryCard}>
                            {cart.items.map(item => (
                                <View key={item.id} style={styles.summaryRow}>
                                    <Text style={styles.summaryItemName} numberOfLines={1}>
                                        {item.product.name} × {item.quantity}
                                    </Text>
                                    <Text style={styles.summaryItemPrice}>₹{item.total}</Text>
                                </View>
                            ))}
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery</Text>
                                <Text style={[styles.summaryValue, { color: Colors.success }]}>FREE</Text>
                            </View>
                            {totalGST > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>GST (Included)</Text>
                                    <Text style={[styles.summaryValue, { color: Colors.textSecondary, fontSize: 13 }]}>₹{totalGST.toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={[styles.divider, { backgroundColor: Colors.gray100 }]} />
                            <View style={styles.summaryRow}>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary }}>Total</Text>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>₹{cart.total}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Payment Method ────────────────────────────────────── */}
                    <View style={[styles.section, { paddingTop: 0 }]}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        {(['cod', 'upi', 'card'] as PaymentMethod[]).map(method => (
                            <TouchableOpacity
                                key={method}
                                onPress={() => setPaymentMethod(method)}
                                style={[
                                    styles.paymentCard,
                                    paymentMethod === method && styles.paymentCardSelected,
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>
                                    {method === 'cod' ? '💵 Cash on Delivery' : method === 'upi' ? '📱 UPI' : '💳 Card'}
                                </Text>
                                {paymentMethod === method && (
                                    <Icon name="check-circle" size={20} color={Colors.primary} library="material" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ── Place Order Button ──────────────────────────────────────── */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={loading}
                    style={[styles.placeOrderButton, loading && { backgroundColor: Colors.gray400 }]}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.placeOrderText}>Place Order  •  ₹{cart.total}</Text>
                    }
                </TouchableOpacity>
            </View>

            {/* ── Pincode Picker Modal ──────────────────────────────────────── */}
            <Modal
                visible={showPincodeModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowPincodeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Select Pincode</Text>
                                <Text style={styles.modalSubtitle}>
                                    {pincodes.length > 0
                                        ? `${pincodes.length} deliverable pincode${pincodes.length !== 1 ? 's' : ''}`
                                        : 'No pincodes available yet'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowPincodeModal(false)} style={styles.closeButton}>
                                <Icon name="close" size={20} color={Colors.textTertiary} library="material" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchBar}>
                            <Icon name="search" size={18} color={Colors.textTertiary} library="material" />
                            <TextInput
                                placeholder="Search by pincode..."
                                value={pincodeSearch}
                                onChangeText={setPincodeSearch}
                                keyboardType="number-pad"
                                style={styles.searchInput}
                                placeholderTextColor={Colors.textTertiary}
                                autoFocus
                            />
                            {pincodeSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setPincodeSearch('')}>
                                    <Icon name="close" size={16} color={Colors.textTertiary} library="material" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* List */}
                        {pincodeLoading ? (
                            <View style={styles.modalCenter}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.modalCenterText}>Loading pincodes...</Text>
                            </View>
                        ) : filteredPincodes.length === 0 ? (
                            <View style={styles.modalCenter}>
                                <Icon name="location-off" size={40} color={Colors.gray300} library="material" />
                                <Text style={styles.modalCenterText}>
                                    {pincodeSearch
                                        ? 'No pincodes match your search'
                                        : 'No serviceable pincodes available yet'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredPincodes}
                                keyExtractor={item => item._id}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                                renderItem={({ item }) => {
                                    const isSelected = selectedPincode?._id === item._id;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedPincode(item);
                                                setShowPincodeModal(false);
                                                setPincodeSearch('');
                                            }}
                                            activeOpacity={0.75}
                                            style={[
                                                styles.pincodeRow,
                                                isSelected && styles.pincodeRowSelected,
                                            ]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.pincodeNumber}>{item.pincode}</Text>
                                                {item.deliveryNote ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                                        <Icon name="info" size={12} color={Colors.info} library="material" />
                                                        <Text style={styles.pincodeNote}>{item.deliveryNote}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            {isSelected && (
                                                <Icon name="check-circle" size={20} color={Colors.primary} library="material" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: SECTION_PADDING,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 14,
    },
    // Address cards
    addressCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressCardSelected: {
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'rgba(248, 128, 14, 0.03)',
    },
    typeBadge: {
        backgroundColor: Colors.gray100,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    addressZip: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    addressStreet: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    checkBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 4,
        marginLeft: 10,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: 'rgba(248, 128, 14, 0.04)',
    },
    addAddressText: {
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    // Form
    formCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    formTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
        fontSize: 14,
        color: Colors.textPrimary,
        minHeight: 52,
        textAlignVertical: 'top',
    },
    pincodeSelector: {
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    pincodeSelectorSelected: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(248,128,14,0.04)',
    },
    pincodeSelectorValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.primary,
        fontVariant: ['tabular-nums'],
        letterSpacing: 3,
    },
    pincodeSelectorPlaceholder: {
        color: Colors.textTertiary,
        fontSize: 14,
    },
    deliveryNoteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 7,
        backgroundColor: 'rgba(59,130,246,0.07)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.15)',
    },
    deliveryNoteText: {
        flex: 1,
        fontSize: 12,
        color: Colors.info,
        fontWeight: '600',
        lineHeight: 17,
    },
    typeChip: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: Colors.gray100,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    typeChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    typeChipTextSelected: {
        color: '#fff',
    },
    cancelButton: {
        flex: 1,
        padding: 13,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    cancelButtonText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    // Summary
    summaryCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    summaryItemName: {
        color: Colors.textSecondary,
        flex: 1,
        fontSize: 13,
        marginRight: 8,
    },
    summaryItemPrice: {
        fontWeight: '600',
        color: Colors.textPrimary,
        fontSize: 13,
    },
    summaryLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray200,
        marginVertical: 10,
    },
    // Payment
    paymentCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.gray200,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentCardSelected: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    // Footer
    footer: {
        padding: 20,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderColor: Colors.gray200,
    },
    placeOrderButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // Pincode modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    modalSubtitle: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 2,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
        marginTop: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
    },
    modalCenter: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    modalCenterText: {
        color: Colors.textTertiary,
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    // Pincode list row
    pincodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: Colors.gray100,
    },
    pincodeRowSelected: {
        backgroundColor: 'rgba(248,128,14,0.07)',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    pincodeNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        fontVariant: ['tabular-nums'],
        letterSpacing: 2,
    },
    pincodeNote: {
        fontSize: 12,
        color: Colors.info,
        fontWeight: '600',
    },
});
