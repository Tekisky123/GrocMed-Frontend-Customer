import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

    const initAddress = async () => {
      try {
        // 1. Explicitly request location permission on app open (crucial for existing & updated customers!)
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
            console.warn('Initial location permission request failed:', permErr);
          }
        }

        // 2. If permission is granted on startup, detect real GPS location immediately!
        if (permissionGranted && isMounted) {
          const detected = await detectCurrentLocation(true);
          if (detected) {
            return;
          }
        }

        // 3. Check stored active address, purging any stale Nanded/empty data
        const stored = await AsyncStorage.getItem(ACTIVE_ADDRESS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const isStale =
            !parsed?.street ||
            parsed.street.toLowerCase() === 'current location' ||
            parsed.street.toLowerCase().includes('nanded');

          if (isStale) {
            await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
          } else if (parsed && parsed.street && isMounted) {
            setActiveAddressState(parsed);
            return;
          }
        }

        // 4. Check user profile saved addresses
        if (user?.addresses && user.addresses.length > 0) {
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
              return;
            }
          }
        }

        // 5. Default fallback to Hyderabad, Telangana with strictly NO landmark
        if (isMounted) {
          setActiveAddressState(DEFAULT_FALLBACK_ADDRESS);
          await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(DEFAULT_FALLBACK_ADDRESS));
        }
      } catch (err) {
        console.error('Error initializing address:', err);
      }
    };

    initAddress();

    return () => {
      isMounted = false;
    };
  }, [user?.addresses]);

  // Reverse geocode, fetch accurate current location, and automatically persist to DB
  const detectCurrentLocation = useCallback(async (isSilent = false): Promise<Address | null> => {
    try {
      setIsLoadingLocation(true);

      // Verify and display location permission if not already taken
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) {
          const req = await Location.requestForegroundPermissionsAsync();
          if (!req.granted) {
            setIsLoadingLocation(false);
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

      // Fetch accurate GPS coordinates
      const coords = await getCoordinates(false);
      if (!coords || coords.isFallback) {
        // Fallback coordinates: set clean Hyderabad, Telangana fallback without landmark
        const fallbackAddress = DEFAULT_FALLBACK_ADDRESS;
        setActiveAddressState(fallbackAddress);
        await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(fallbackAddress));
        setIsLoadingLocation(false);
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
          } catch (dbErr) {
            console.warn('Auto-save detected address to backend DB failed:', dbErr);
          }
        }

        setIsLoadingLocation(false);
        return detectedAddress;
      }

      // If reverseGeocode failed, use clean fallback without landmark
      const fallbackAddress = DEFAULT_FALLBACK_ADDRESS;
      setActiveAddressState(fallbackAddress);
      await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(fallbackAddress));
      setIsLoadingLocation(false);
      return fallbackAddress;
    } catch (err) {
      console.error('detectCurrentLocation error:', err);
      setIsLoadingLocation(false);
      return null;
    }
  }, [user?.addresses, user?.shopName, isAuthenticated, updateProfile, showToast]);

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
