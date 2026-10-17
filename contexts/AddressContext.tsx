import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  getCoordinates,
  reverseGeocode,
  requestLocationPermission,
  isFallbackCoords,
  HYDERABAD_FALLBACK_COORDS,
} from '@/utils/locationHelper';

const ACTIVE_ADDRESS_KEY = '@grocmed_active_address';

export const DEFAULT_FALLBACK_ADDRESS: Address = {
  id: 'default_fallback',
  street: 'Hyderabad, Telangana',
  landmark: undefined, // Strictly NO landmark for fallback
  city: 'Hyderabad',
  state: 'Telangana',
  zip: '500001',
  type: 'Home',
  isDefault: true,
};

interface AddressContextType {
  activeAddress: Address | null;
  displayTitle: string;
  displaySubtitle: string;
  currentCoords: { latitude: number; longitude: number } | null;
  isLoadingLocation: boolean;
  isAddressModalOpen: boolean;
  editingAddress: Address | null;
  openAddressModal: (addressToEdit?: Address | null) => void;
  closeAddressModal: () => void;
  detectCurrentLocation: (isSilent?: boolean) => Promise<Address | null>;
  selectAddress: (address: Address) => Promise<void>;
  saveAddress: (addressData: {
    id?: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    zip: string;
    type: 'Home' | 'Work' | 'Shop' | 'Other';
    isDefault?: boolean;
    name?: string;
    phone?: string;
  }) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<boolean>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeAddress, setActiveAddressState] = useState<Address | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const hasInitRef = useRef(false);
  const isDetectingRef = useRef(false);

  // Helper to extract clean display titles like Blinkit/Instamart
  const displayTitle = useMemo(() => {
    if (!activeAddress) return 'Select Delivery Location';
    if (activeAddress.type === 'Shop' && user?.shopName) return user.shopName;
    if (activeAddress.type === 'Home') return 'Home';
    if (activeAddress.type === 'Work') return 'Work';

    // Extract area/colony from street (e.g. Ramdaspeth, Sitabuldi)
    const cleanStreet = (activeAddress.street || '')
      .replace(/^Current Location,?\s*/i, '')
      .replace(/,?\s*Current Location$/i, '')
      .trim();

    if (cleanStreet) {
      const firstPart = cleanStreet.split(',')[0].trim();
      if (firstPart && firstPart.length < 28 && !firstPart.toLowerCase().includes('current location')) {
        return firstPart;
      }
    }
    return activeAddress.city || 'Delivery Location';
  }, [activeAddress, user?.shopName]);

  const displaySubtitle = useMemo(() => {
    if (!activeAddress) return 'Tap to select delivery address';
    const parts: string[] = [];

    // Strip "Current Location" from street text
    const cleanStreet = (activeAddress.street || '')
      .replace(/^Current Location,?\s*/i, '')
      .replace(/,?\s*Current Location$/i, '')
      .trim();

    if (cleanStreet && !cleanStreet.toLowerCase().includes('current location')) {
      parts.push(cleanStreet);
    }
    if (
      activeAddress.landmark &&
      !cleanStreet.toLowerCase().includes(activeAddress.landmark.toLowerCase())
    ) {
      parts.push(activeAddress.landmark);
    }
    if (
      activeAddress.city &&
      !parts.some((p) => p.toLowerCase().includes(activeAddress.city.toLowerCase()))
    ) {
      parts.push(activeAddress.city);
    }
    if (activeAddress.zip) {
      parts.push(activeAddress.zip);
    }
    return parts.join(', ') || activeAddress.city || 'Delivery Address';
  }, [activeAddress]);

  // Load saved active address on initial mount, purging any stale telecom gateway or distant landmark entries
  useEffect(() => {
    let isMounted = true;
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    const initAddress = async () => {
      try {
        // Step 1: Immediately restore cached or profile address so UI is never stuck on blank/loading!
        let hasInitialAddress = false;
        const stored = await AsyncStorage.getItem(ACTIVE_ADDRESS_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const isStale =
              !parsed?.street ||
              parsed.street.toLowerCase() === 'current location' ||
              parsed.street.toLowerCase().includes('nanded');

            if (isStale) {
              await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
            } else if (parsed && parsed.street && isMounted) {
              setActiveAddressState(parsed);
              hasInitialAddress = true;
            }
          } catch {
            await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
          }
        }

        // Check user profile addresses if no stored address yet
        if (!hasInitialAddress && user?.addresses && user.addresses.length > 0) {
          const validAddrs = user.addresses.filter(
            (a) =>
              a.street &&
              a.street.toLowerCase() !== 'current location' &&
              !a.street.toLowerCase().includes('nanded')
          );
          if (validAddrs.length > 0) {
            const defaultAddr = validAddrs.find((a) => a.isDefault) || validAddrs[0];
            if (defaultAddr && isMounted) {
              setActiveAddressState(defaultAddr);
              await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(defaultAddr));
              hasInitialAddress = true;
            }
          }
        }

        // If still no address, set clean Hyderabad, Telangana default fallback
        if (!hasInitialAddress && isMounted) {
          setActiveAddressState(DEFAULT_FALLBACK_ADDRESS);
          await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(DEFAULT_FALLBACK_ADDRESS));
        }

        // Step 2: Explicitly request location permission on app open (crucial for existing & updated customers!)
        let permissionGranted = false;
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          try {
            const currentPerm = await Location.getForegroundPermissionsAsync();
            if (!currentPerm.granted) {
              const req = await Location.requestForegroundPermissionsAsync();
              permissionGranted = req.granted;
            } else {
              permissionGranted = true;
            }
          } catch (permErr) {
            console.warn('Initial location permission request error:', permErr);
          }
        }

        // Step 3: Only auto-detect GPS if user had no existing saved/selected address
        if (permissionGranted && isMounted && !hasInitialAddress) {
          await detectCurrentLocation(true);
        }
      } catch (err) {
        console.error('Error initializing address:', err);
      }
    };

    initAddress();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Reverse geocode, fetch accurate current location, and automatically persist to DB
  const detectCurrentLocation = useCallback(async (isSilent = false): Promise<Address | null> => {
    // Prevent overlapping duplicate location fetches
    if (isDetectingRef.current) {
      return null;
    }
    isDetectingRef.current = true;

    // Safety watchdog: under no circumstance can loading state get stuck!
    const watchdog = setTimeout(() => {
      setIsLoadingLocation(false);
      isDetectingRef.current = false;
    }, 6000);

    try {
      setIsLoadingLocation(true);

      // Verify and display location permission if not already taken
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) {
          const req = await Location.requestForegroundPermissionsAsync();
          if (!req.granted) {
            if (!isSilent) {
              if (!req.canAskAgain) {
                Alert.alert(
                  'Location Permission Required',
                  'Location access is blocked in your app settings. Please enable location permission in Settings to use your current location.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                  ]
                );
              } else {
                Alert.alert(
                  'Location Permission Needed',
                  'Please grant location permission to detect your current delivery location.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Try Again', onPress: () => detectCurrentLocation(false) },
                  ]
                );
              }
            }
            return null;
          }
        }
      }

      // Fetch accurate GPS coordinates with quick fallback
      const coords = await getCoordinates(false);
      if (!coords || coords.isFallback) {
        // Fallback coordinates: set clean Hyderabad, Telangana fallback without landmark
        const fallbackAddress = DEFAULT_FALLBACK_ADDRESS;
        setActiveAddressState(fallbackAddress);
        await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(fallbackAddress));
        if (!isSilent) {
          showToast('GPS fix timed out. Defaulted to Hyderabad, Telangana.', 'info');
        }
        return fallbackAddress;
      }

      setCurrentCoords(coords);
      await AsyncStorage.setItem('@grocmed_current_coords', JSON.stringify(coords));

      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      if (geo) {
        const detectedStreet =
          geo.street && !geo.street.toLowerCase().includes('current location')
            ? geo.street
            : geo.title && !geo.title.toLowerCase().includes('current location')
            ? geo.title
            : 'Hyderabad, Telangana';

        const detectedAddress: Address = {
          id: `gps_${Date.now()}`,
          street: detectedStreet,
          landmark: geo.landmark || undefined,
          city: geo.city || 'Hyderabad',
          state: geo.state || 'Telangana',
          zip: geo.zip || '',
          type: user?.shopName ? 'Shop' : 'Home',
          isDefault: true,
        };

        setActiveAddressState(detectedAddress);
        await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(detectedAddress));

        // Automatically save to backend database if customer is logged in
        if (isAuthenticated) {
          try {
            const currentAddresses = user?.addresses || [];
            const existingIndex = currentAddresses.findIndex(
              (a) =>
                a.street.trim().toLowerCase() === detectedAddress.street.trim().toLowerCase() &&
                a.city.trim().toLowerCase() === detectedAddress.city.trim().toLowerCase()
            );

            // Only update backend profile if address is actually new or not currently default
            const needsUpdate = existingIndex === -1 || !currentAddresses[existingIndex]?.isDefault;

            if (needsUpdate) {
              let updatedList: Address[];
              if (existingIndex >= 0) {
                updatedList = currentAddresses.map((a, i) =>
                  i === existingIndex
                    ? { ...detectedAddress, id: a.id, isDefault: true }
                    : { ...a, isDefault: false }
                );
              } else {
                updatedList = [
                  ...currentAddresses.map((a) => ({ ...a, isDefault: false })),
                  detectedAddress,
                ];
              }

              await updateProfile({ addresses: updatedList });
            }
          } catch (dbErr) {
            console.warn('Auto-save detected address to backend DB failed:', dbErr);
          }
        }

        return detectedAddress;
      }

      // If reverseGeocode failed, use clean fallback without landmark
      const fallbackAddress = DEFAULT_FALLBACK_ADDRESS;
      setActiveAddressState(fallbackAddress);
      await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(fallbackAddress));
      return fallbackAddress;
    } catch (err) {
      console.error('detectCurrentLocation error:', err);
      return null;
    } finally {
      isDetectingRef.current = false;
      clearTimeout(watchdog);
      setIsLoadingLocation(false);
    }
  }, [user?.id, user?.shopName, isAuthenticated, updateProfile, showToast]);

  const selectAddress = useCallback(async (address: Address) => {
    setActiveAddressState(address);
    await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(address));
    setIsAddressModalOpen(false);
    showToast('Delivery address updated', 'success');
  }, [showToast]);

  const saveAddress = useCallback(async (addressData: {
    id?: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    zip: string;
    type: 'Home' | 'Work' | 'Shop' | 'Other';
    isDefault?: boolean;
    name?: string;
    phone?: string;
  }): Promise<Address> => {
    const finalAddress: Address = {
      id: addressData.id || `addr_${Date.now()}`,
      street: addressData.street.trim(),
      landmark: addressData.landmark?.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim() || 'Telangana',
      zip: addressData.zip.trim(),
      type: addressData.type || 'Shop',
      isDefault: addressData.isDefault ?? true,
      name: addressData.name,
      phone: addressData.phone,
    };

    setActiveAddressState(finalAddress);
    await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(finalAddress));

    // If authenticated, also persist to user profile in backend database
    if (isAuthenticated) {
      try {
        const currentAddresses = user?.addresses || [];
        const existingIndex = currentAddresses.findIndex((a) => a.id === finalAddress.id);
        
        let updatedList: Address[];
        if (existingIndex >= 0) {
          updatedList = currentAddresses.map((a, i) => (i === existingIndex ? finalAddress : a));
        } else {
          updatedList = [...currentAddresses, finalAddress];
        }

        // If finalAddress is default, unset other defaults
        if (finalAddress.isDefault) {
          updatedList = updatedList.map((a) => ({
            ...a,
            isDefault: a.id === finalAddress.id,
          }));
        }

        await updateProfile({ addresses: updatedList });
      } catch (err) {
        console.error('Failed to sync address to backend profile:', err);
      }
    }

    setIsAddressModalOpen(false);
    showToast('Address saved successfully!', 'success');
    return finalAddress;
  }, [isAuthenticated, user?.addresses, updateProfile, showToast]);

  const deleteAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      try {
        // 1. Remove from backend user profile if authenticated
        if (isAuthenticated && user?.addresses) {
          const updatedList = user.addresses.filter((a) => a.id !== addressId);
          await updateProfile({ addresses: updatedList });
        }

        // 2. If the deleted address was currently active, switch to next address or fallback
        if (activeAddress?.id === addressId) {
          const remaining = (user?.addresses || []).filter((a) => a.id !== addressId);
          const nextAddress = remaining.length > 0 ? remaining[0] : DEFAULT_FALLBACK_ADDRESS;
          setActiveAddressState(nextAddress);
          await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(nextAddress));
        }

        showToast('Address removed successfully', 'success');
        return true;
      } catch (err) {
        console.error('deleteAddress error:', err);
        showToast('Failed to delete address', 'error');
        return false;
      }
    },
    [isAuthenticated, user?.addresses, activeAddress, updateProfile, showToast]
  );

  const openAddressModal = useCallback((addressToEdit: Address | null = null) => {
    setEditingAddress(addressToEdit);
    setIsAddressModalOpen(true);
  }, []);

  const closeAddressModal = useCallback(() => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  }, []);

  const value = useMemo(() => ({
    activeAddress,
    currentCoords,
    displayTitle,
    displaySubtitle,
    isLoadingLocation,
    isAddressModalOpen,
    editingAddress,
    openAddressModal,
    closeAddressModal,
    detectCurrentLocation,
    selectAddress,
    saveAddress,
    deleteAddress,
  }), [
    activeAddress,
    currentCoords,
    displayTitle,
    displaySubtitle,
    isLoadingLocation,
    isAddressModalOpen,
    editingAddress,
    openAddressModal,
    closeAddressModal,
    detectCurrentLocation,
    selectAddress,
    saveAddress,
    deleteAddress,
  ]);

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
