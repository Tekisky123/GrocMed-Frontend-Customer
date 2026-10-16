import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { useAddress } from '@/contexts/AddressContext';
import { useCart } from '@/contexts/CartContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { router } from 'expo-router';

export const CustomerAddressHeader: React.FC = () => {
  const { displayTitle, displaySubtitle, openAddressModal, isLoadingLocation } = useAddress();
  const { getItemCount } = useCart();
  const { setCartIconPosition } = useCartAnimation();

  const cartCount = getItemCount();

  return (
    <View style={styles.headerContainer}>
      {/* Top Bar: Brand, Express Badge, and Cart */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Image
            source={require('@/assets/images/logo-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>
            Groc<Text style={{ color: Colors.primary }}>Med</Text>
          </Text>
        </View>

        <View style={styles.topRightActions}>
          {/* Blinkit / Instamart style Express Delivery Pill */}
          <View style={styles.expressBadge}>
            <Icon name="bolt" size={13} color="#D97706" library="material" />
            <Text style={styles.expressBadgeText}>10-15 MINS</Text>
          </View>

          {/* Cart Icon */}
          <TouchableOpacity
            onLayout={(e) => {
              const { x, y, width: w, height: h } = e.nativeEvent.layout;
              setCartIconPosition({ x, y, width: w, height: h });
            }}
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.cartButton}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="shopping-cart" size={22} color="#1E293B" library="material" />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Blinkit / Instamart style Address Strip */}
      <TouchableOpacity
        style={styles.addressBar}
        onPress={() => openAddressModal()}
        activeOpacity={0.85}
      >
        <View style={styles.pinCircle}>
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Icon name="location-on" size={18} color={Colors.primary} library="material" />
          )}
        </View>

        <View style={styles.addressTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Icon name="keyboard-arrow-down" size={18} color="#0F172A" library="material" />
          </View>
          <Text style={styles.locationSubtitle} numberOfLines={1}>
            {isLoadingLocation ? 'Detecting address...' : displaySubtitle}
          </Text>
        </View>

        <View style={styles.changePill}>
          <Text style={styles.changePillText}>Change</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  expressBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.2,
  },
  cartButton: {
    position: 'relative',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pinCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  addressTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: '85%',
  },
  locationSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  changePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
});
