import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAddress } from '@/contexts/AddressContext';
import { useAuth } from '@/contexts/AuthContext';
import { Address } from '@/types';
import { searchPlaces, PlaceSuggestion, findNearbyLandmark } from '@/utils/locationHelper';

export const AddressModal: React.FC = () => {
  const {
    isAddressModalOpen,
    closeAddressModal,
    activeAddress,
    currentCoords,
    editingAddress,
    saveAddress,
    selectAddress,
    detectCurrentLocation,
    isLoadingLocation,
  } = useAddress();

  const { user } = useAuth();

  const [isEditingForm, setIsEditingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [zip, setZip] = useState('');
  const [type, setType] = useState<'Home' | 'Work' | 'Shop' | 'Other'>('Shop');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchTimer = useRef<any>(null);

  // Sync form when opening modal or editing
  useEffect(() => {
    if (isAddressModalOpen) {
      setSearchQuery('');
      setSuggestions([]);
      if (editingAddress) {
        setStreet(editingAddress.street || '');
        setLandmark(editingAddress.landmark || '');
        setCity(editingAddress.city || '');
        setState(editingAddress.state || 'Maharashtra');
        setZip(editingAddress.zip || '');
        setType(editingAddress.type || 'Shop');
        setIsEditingForm(true);
      } else if (!activeAddress && (!user?.addresses || user.addresses.length === 0)) {
        setIsEditingForm(true);
      } else {
        setIsEditingForm(false);
      }
      setErrorMsg('');
    }
  }, [isAddressModalOpen, editingAddress, activeAddress, user?.addresses]);

  // Handle Search Input with local viewbox bounding
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      // Pass user's current coordinates to strictly bound results to user's location/city!
      const results = await searchPlaces(text, currentCoords);
      setSuggestions(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectSuggestion = async (place: PlaceSuggestion) => {
    setStreet(place.street || place.title);
    setCity(place.city || 'Nagpur');
    setState(place.state || 'Maharashtra');
    setZip(place.zip || '');
    setType(user?.shopName ? 'Shop' : 'Home');
    setSearchQuery('');
    setSuggestions([]);
    setIsEditingForm(true);

    if (place.landmark) {
      setLandmark(place.landmark);
    } else if (place.latitude && place.longitude) {
      const detectedLm = await findNearbyLandmark(place.latitude, place.longitude);
      if (detectedLm) {
        setLandmark(detectedLm);
      } else {
        setLandmark('');
      }
    } else {
      setLandmark('');
    }
  };

  const handleUseCurrentLocation = async () => {
    setErrorMsg('');
    setSearchQuery('');
    setSuggestions([]);
    const detected = await detectCurrentLocation(false);
    if (detected) {
      setStreet(detected.street || '');
      setLandmark(detected.landmark || '');
      setCity(detected.city || '');
      setState(detected.state || 'Maharashtra');
      setZip(detected.zip || '');
      setType(detected.type || 'Shop');
      setIsEditingForm(true);
    }
  };

  const handleSave = async () => {
    if (!street.trim()) {
      setErrorMsg('Please enter street, area or building name');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter city');
      return;
    }
    if (!zip.trim() || zip.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit postal code');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      await saveAddress({
        id: editingAddress?.id,
        street: street.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim() || 'Maharashtra',
        zip: zip.trim(),
        type,
        isDefault: true,
      });
      setIsEditingForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const savedAddresses = user?.addresses || [];
  const hasActiveNotInSaved = Boolean(
    activeAddress && !savedAddresses.some((a) => a.id === activeAddress.id)
  );

  return (
    <Modal
      visible={isAddressModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeAddressModal}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeAddressModal}
        />

        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Delivery Location</Text>
              <Text style={styles.modalSubtitle}>Order will be delivered to this location</Text>
            </View>
            <TouchableOpacity
              onPress={closeAddressModal}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color="#64748B" library="material" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Blinkit / Instamart Style Search Bar */}
            <View style={styles.searchBarContainer}>
              <Icon name="search" size={20} color="#64748B" library="material" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search area, landmark, street in your city..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearchChange}
                clearButtonMode="while-editing"
              />
              {isSearching ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                  <Icon name="cancel" size={18} color="#94A3B8" library="material" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Fully Scrollable Suggestions List (No fixed height trap) */}
            {suggestions.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionsHeader}>
                  <Text style={styles.suggestionsHeaderText}>
                    📍 PLACES IN YOUR AREA ({suggestions.length})
                  </Text>
                  <TouchableOpacity onPress={() => { setSuggestions([]); setSearchQuery(''); }}>
                    <Text style={styles.suggestionsClearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.placeId}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionIcon}>
                      <Icon name="place" size={18} color={Colors.primary} library="material" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10, marginRight: 6 }}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.landmark ? (
                        <Text style={styles.landmarkTag} numberOfLines={1}>
                          📍 {item.landmark}
                        </Text>
                      ) : null}
                      <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={18} color="#94A3B8" library="material" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* GPS Detect Button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleUseCurrentLocation}
              disabled={isLoadingLocation}
              activeOpacity={0.8}
            >
              <View style={styles.gpsIconCircle}>
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Icon name="my-location" size={20} color={Colors.primary} library="material" />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.gpsTitle}>Use Current Location</Text>
                <Text style={styles.gpsSubtitle}>
                  {isLoadingLocation ? 'Detecting location...' : 'Using GPS'}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" library="material" />
            </TouchableOpacity>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Icon name="error-outline" size={16} color="#DC2626" library="material" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* If Not in Edit Mode: Show List of Saved Addresses */}
            {!isEditingForm ? (
              <View style={{ marginTop: 16 }}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setStreet('');
                      setLandmark('');
                      setCity('');
                      setZip('');
                      setType('Shop');
                      setIsEditingForm(true);
                    }}
                    style={styles.addNewBtn}
                  >
                    <Icon name="add" size={16} color={Colors.primary} library="material" />
                    <Text style={styles.addNewBtnText}>Add New</Text>
                  </TouchableOpacity>
                </View>

                {/* If active address exists but not in saved list (e.g. detected GPS) */}
                {hasActiveNotInSaved && activeAddress ? (
                  <TouchableOpacity
                    style={[styles.addressCard, styles.activeAddressCard]}
                    activeOpacity={0.9}
                  >
                    <View style={styles.addressCardHeader}>
                      <View style={styles.typeBadge}>
                        <Icon name="location-on" size={13} color="#2563EB" library="material" />
                        <Text style={styles.typeBadgeText}>Current Location</Text>
                      </View>
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>SELECTED</Text>
                      </View>
                    </View>
                    <Text style={styles.addressStreet}>{activeAddress.street}</Text>
                    {activeAddress.landmark ? (
                      <Text style={styles.landmarkBadge}>📍 {activeAddress.landmark}</Text>
                    ) : null}
                    <Text style={styles.addressCity}>
                      {activeAddress.city}, {activeAddress.state} - {activeAddress.zip}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setStreet(activeAddress.street);
                        setLandmark(activeAddress.landmark || '');
                        setCity(activeAddress.city);
                        setState(activeAddress.state);
                        setZip(activeAddress.zip);
                        setType(activeAddress.type || 'Shop');
                        setIsEditingForm(true);
                      }}
                      style={styles.editCardBtn}
                    >
                      <Icon name="edit" size={14} color={Colors.primary} library="material" />
                      <Text style={styles.editCardBtnText}>Edit / Save to Profile</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : null}

                {/* Saved addresses list */}
                {savedAddresses.map((addr) => {
                  const isSelected = activeAddress?.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.addressCard, isSelected && styles.activeAddressCard]}
                      onPress={() => selectAddress(addr)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.addressCardHeader}>
                        <View style={styles.typeBadge}>
                          <Icon
                            name={
                              addr.type === 'Shop'
                                ? 'store'
                                : addr.type === 'Home'
                                ? 'home'
                                : 'business'
                            }
                            size={14}
                            color={Colors.primary}
                            library="material"
                          />
                          <Text style={styles.typeBadgeText}>
                            {addr.type ? addr.type.toUpperCase() : 'SHOP'}
                          </Text>
                        </View>
                        {isSelected ? (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>SELECTED</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.addressStreet}>{addr.street}</Text>
                      {addr.landmark ? (
                        <Text style={styles.landmarkBadge}>📍 {addr.landmark}</Text>
                      ) : null}
                      <Text style={styles.addressCity}>
                        {addr.city}, {addr.state} - {addr.zip}
                      </Text>

                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                          onPress={() => {
                            setStreet(addr.street);
                            setLandmark(addr.landmark || '');
                            setCity(addr.city);
                            setState(addr.state);
                            setZip(addr.zip);
                            setType(addr.type || 'Shop');
                            setIsEditingForm(true);
                          }}
                          style={styles.editIconBtn}
                        >
                          <Icon name="edit" size={14} color="#64748B" library="material" />
                          <Text style={styles.editIconText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => selectAddress(addr)}
                          style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                        >
                          <Text
                            style={[
                              styles.selectBtnText,
                              isSelected && styles.selectBtnTextActive,
                            ]}
                          >
                            {isSelected ? 'Delivering Here' : 'Deliver Here'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {savedAddresses.length === 0 && !activeAddress ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="location-off" size={40} color="#CBD5E1" library="material" />
                    <Text style={styles.emptyTitle}>No Addresses Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Search an area above, click "Use Current Location", or enter address below.
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              /* Edit / Add Address Form */
              <View style={styles.formContainer}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.formTitle}>
                    {editingAddress ? 'Edit Delivery Address' : 'Enter Delivery Address'}
                  </Text>
                  {savedAddresses.length > 0 ? (
                    <TouchableOpacity onPress={() => setIsEditingForm(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Address Type Chips */}
                <Text style={styles.inputLabel}>ADDRESS TYPE</Text>
                <View style={styles.chipsRow}>
                  {[
                    { label: 'Shop / Store', val: 'Shop', icon: 'store' },
                    { label: 'Home', val: 'Home', icon: 'home' },
                    { label: 'Work', val: 'Work', icon: 'business' },
                    { label: 'Other', val: 'Other', icon: 'place' },
                  ].map((chip) => {
                    const isSelected = type === chip.val;
                    return (
                      <TouchableOpacity
                        key={chip.val}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => setType(chip.val as any)}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={chip.icon}
                          size={15}
                          color={isSelected ? '#FFFFFF' : '#475569'}
                          library="material"
                        />
                        <Text
                          style={[styles.chipText, isSelected && styles.chipTextSelected]}
                        >
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Shop / Building / Street */}
                <Text style={styles.inputLabel}>SHOP / BUILDING / STREET ADDRESS *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Shop No. 5, Main Road, Sitabuldi"
                  placeholderTextColor="#94A3B8"
                  value={street}
                  onChangeText={setStreet}
                />

                {/* Landmark Field */}
                <Text style={styles.inputLabel}>LANDMARK / NEARBY PLACE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Near Lokmat Square, Opposite State Bank"
                  placeholderTextColor="#94A3B8"
                  value={landmark}
                  onChangeText={setLandmark}
                />

                {/* City & Pincode in 2 columns */}
                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>CITY *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Nagpur"
                      placeholderTextColor="#94A3B8"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>PINCODE *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 440001"
                      placeholderTextColor="#94A3B8"
                      value={zip}
                      onChangeText={setZip}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* State */}
                <Text style={styles.inputLabel}>STATE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Maharashtra"
                  placeholderTextColor="#94A3B8"
                  value={state}
                  onChangeText={setState}
                />

                {/* Save Button */}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={styles.btnContentRow}>
                      <Icon name="check-circle" size={18} color="#FFFFFF" library="material" />
                      <Text style={styles.saveBtnText}>Save & Deliver Here</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 2,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginBottom: 14,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  suggestionsHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  suggestionsClearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  landmarkTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 2,
  },
  suggestionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  gpsSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addNewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  activeAddressCard: {
    borderColor: Colors.primary,
    backgroundColor: '#F8FAFC',
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  addressStreet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  landmarkBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 2,
  },
  addressCity: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  editIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  selectBtnTextActive: {
    color: '#FFFFFF',
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editCardBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 12,
    paddingBottom: 24,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
