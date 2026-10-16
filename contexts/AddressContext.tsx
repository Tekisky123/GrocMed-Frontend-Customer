import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getCoordinates, reverseGeocode } from '@/utils/locationHelper';

const ACTIVE_ADDRESS_KEY = '@grocmed_active_address';

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
        const stored = await AsyncStorage.getItem(ACTIVE_ADDRESS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const isStale =
            parsed?.city?.toLowerCase().includes('nanded') ||
            parsed?.street?.toLowerCase().includes('nanded') ||
            parsed?.zip === '431600' ||
            parsed?.zip === '431601' ||
            parsed?.street?.toLowerCase() === 'current location' ||
            parsed?.landmark?.toLowerCase().includes('manas chowk'); // Manas chowk was 1.5km distant landmark

          if (isStale) {
            console.log('Clearing stale location/distant landmark from storage...');
            await AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY);
          } else if (parsed && parsed.street && isMounted) {
            setActiveAddressState(parsed);
            return;
          }
        }

        // If user already has saved addresses in profile, use default or first
        if (user?.addresses && user.addresses.length > 0) {
          const validAddrs = user.addresses.filter(
            (a) =>
              !a.city?.toLowerCase().includes('nanded') &&
              !a.street?.toLowerCase().includes('nanded') &&
              a.street?.toLowerCase() !== 'current location' &&
              !a.landmark?.toLowerCase().includes('manas chowk') &&
              a.zip !== '431600' &&
              a.zip !== '431601'
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

        // If no saved address found, request location permission & detect
        if (isMounted) {
          detectCurrentLocation(true);
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

  // Reverse geocode and fetch accurate current location
  const detectCurrentLocation = useCallback(async (isSilent = false): Promise<Address | null> => {
    try {
      setIsLoadingLocation(true);

      const coords = await getCoordinates();
      if (!coords) {
        if (!isSilent) {
          showToast('Location permission is required or location unavailable. Please enter address manually.', 'error');
        }
        setIsLoadingLocation(false);
        return null;
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
            : geo.city || 'Nagpur';

        const detectedAddress: Address = {
          id: `gps_${Date.now()}`,
          street: detectedStreet,
          landmark: geo.landmark,
          city: geo.city || 'Nagpur',
          state: geo.state || 'Maharashtra',
          zip: geo.zip || '',
          type: user?.shopName ? 'Shop' : 'Home',
          isDefault: true,
        };

        setActiveAddressState(detectedAddress);
        await AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(detectedAddress));

        if (!isSilent) {
          showToast('Location updated', 'success');
        }

        return detectedAddress;
      } else {
        if (!isSilent) {
          showToast('Unable to detect address automatically. Please select or enter manually.', 'info');
        }
      }
    } catch (err: any) {
      console.error('Location detection error:', err);
      if (!isSilent) {
        showToast('Unable to detect current location. Please enter manually.', 'error');
      }
    } finally {
      setIsLoadingLocation(false);
    }
    return null;
  }, [showToast, user?.shopName]);

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
      state: addressData.state.trim() || 'Maharashtra',
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
