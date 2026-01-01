import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { Colors } from '@/constants/colors';
import { MOCK_BANNERS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Category, Product } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20; // Consistent section padding
const ITEM_SPACING = 12; // Consistent spacing between items

export default function HomeScreen() {
  const { getItemCount, addToCart } = useCart();
  const { user } = useAuth();
  const [bannerIndex, setBannerIndex] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const featuredProducts = MOCK_PRODUCTS.slice(0, 6);
  const cartItemCount = getItemCount();
  const dealsProducts = MOCK_PRODUCTS.filter(p => p.discount && p.discount > 15).slice(0, 4);
  const newArrivals = MOCK_PRODUCTS.slice(-4).reverse();
  const topRated = [...MOCK_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/products/category',
      params: { categoryId: category.id, categoryName: category.name },
    });
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const handleSearchPress = () => {
    router.push('/products/search');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Modern E-commerce Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          paddingTop: 50,
          paddingBottom: 18,
          paddingHorizontal: SECTION_PADDING,
          backgroundColor: Colors.background,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
          zIndex: 100,
        }}
      >
        {/* Top Row: GrocMed and Cart */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          {/* GrocMed Logo */}
          <View style={{ height: 50, justifyContent: 'center' }}>
            <Image
              source={require('@/assets/images/logo-removebg-preview.png')}
              style={{
                width: 160,
                height: 60,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Cart Icon */}
          <View>
            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={{
                position: 'relative',
                backgroundColor: 'rgba(99, 176, 65, 0.1)',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: 'rgba(99, 176, 65, 0.2)',
              }}
              activeOpacity={0.8}
            >
              <Icon name={Icons.cart.name} size={24} color={Colors.primary} library={Icons.cart.library} />
              {cartItemCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: Colors.accent,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: Colors.background,
                }}>
                  <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '800' }}>
                    {cartItemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Search Bar */}
        <TouchableOpacity
          onPress={handleSearchPress}
          activeOpacity={0.95}
        >
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: Colors.primaryDark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Icon name={Icons.search.name} size={20} color={Colors.primary} library={Icons.search.library} />
            <Text style={{
              color: Colors.textTertiary,
              fontSize: 15,
              flex: 1,
              marginLeft: 12,
              fontWeight: '400',
            }}>
              Search for products, brands and more
            </Text>
            <Icon name="mic" size={20} color={Colors.primary} library="material" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Modern Premium Carousel */}
        <Animated.View style={{ marginTop: 24, marginBottom: 8, opacity: fadeAnim }}>
          <FlatList
            data={MOCK_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setBannerIndex(index);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width }}
                onPress={() => item.categoryId && handleCategoryPress(
                  MOCK_CATEGORIES.find((c) => c.id === item.categoryId)!
                )}
                activeOpacity={0.95}
              >
                <View style={{
                  marginHorizontal: SECTION_PADDING,
                  height: 200,
                  borderRadius: 24,
                  backgroundColor: Colors.surface,
                  shadowColor: Colors.shadow,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 8,
                }}>
                  <View style={{
                    flex: 1,
                    borderRadius: 24,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <Image
                      source={{ uri: item.image }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                    />
                    {/* Modern Overlay Gradient Effect */}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      backgroundColor: 'rgba(0,0,0,0.35)', // Simple darken for readability
                      paddingHorizontal: 20,
                      paddingBottom: 20,
                      justifyContent: 'flex-end',
                    }}>
                      <Text style={{
                        color: Colors.textWhite,
                        fontSize: 28,
                        fontWeight: '800',
                        letterSpacing: -0.5,
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                        marginBottom: 12,
                      }}>
                        {item.title}
                      </Text>
                      <View style={{
                        backgroundColor: Colors.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        alignSelf: 'flex-start',
                      }}>
                        <Text style={{ color: Colors.textWhite, fontWeight: '700', fontSize: 13 }}>
                          Shop Now
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          {/* Pagination Indicators */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {MOCK_BANNERS.map((_, index) => (
              <Animated.View
                key={index}
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: index === bannerIndex ? 32 : 8,
                  backgroundColor: index === bannerIndex ? Colors.primary : Colors.gray300,
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Modern Category Grid */}
        <Animated.View style={{ marginTop: 20, marginBottom: 24, paddingHorizontal: SECTION_PADDING, opacity: fadeAnim }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: Colors.textPrimary,
              letterSpacing: -0.2,
            }}>
              Categories
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            {MOCK_CATEGORIES.filter(category => category.id !== '9' && category.id !== '10').map((category) => {
              const categoryIcon = CATEGORY_ICONS[category.id] || { name: 'category', library: 'material' as const };
              const cardWidth = (width - (SECTION_PADDING * 2) - (ITEM_SPACING * 3)) / 4;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                  style={{
                    width: cardWidth,
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <View style={{
                    width: cardWidth - 4,
                    height: cardWidth - 4,
                    backgroundColor: Colors.textWhite,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: Colors.gray200,
                    shadowColor: Colors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <Icon
                      name={categoryIcon.name}
                      size={28}
                      color={Colors.primary}
                      library={categoryIcon.library}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      textAlign: 'center',
                      color: Colors.textPrimary,
                      fontWeight: '500',
                      lineHeight: 13,
                    }}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Mega Deals Section */}
        {dealsProducts.length > 0 && (
          <Animated.View style={{ marginBottom: 36, opacity: fadeAnim }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: SECTION_PADDING,
              marginBottom: 24,
            }}>
              <View>
                <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.8 }}>
                  Best Offers
                </Text>
                <View style={{
                  width: 60,
                  height: 4,
                  backgroundColor: Colors.accent,
                  borderRadius: 2,
                  marginTop: 8,
                }} />
              </View>
              <TouchableOpacity
                onPress={() => router.push('/products/search')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: `${Colors.accent}15`,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: 15, marginRight: 6 }}>
                  See All
                </Text>
                <Icon name={Icons.arrowForward.name} size={18} color={Colors.accent} library={Icons.arrowForward.library} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dealsProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: ITEM_SPACING }}
              renderItem={({ item }) => (
                <View style={{ width: width * 0.54, marginHorizontal: ITEM_SPACING / 2 }}>
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                </View>
              )}
            />
          </Animated.View>
        )}



        {/* Modern All Products Grid - Uniform Cards */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, opacity: fadeAnim, marginBottom: 32 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <View>
              <Text style={{
                fontSize: 26,
                fontWeight: '800',
                color: Colors.textPrimary,
                letterSpacing: -0.8,
                marginBottom: 4,
              }}>
                All Products
              </Text>
              <View style={{
                width: 60,
                height: 4,
                backgroundColor: Colors.primary,
                borderRadius: 2,
                marginTop: 8,
              }} />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/products/search')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${Colors.primary}15`,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 14,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 15, marginRight: 6 }}>
                See All
              </Text>
              <Icon name={Icons.arrowForward.name} size={18} color={Colors.primary} library={Icons.arrowForward.library} />
            </TouchableOpacity>
          </View>

          {/* Modern Uniform Grid Layout - Refactored to use ProductCard */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            {MOCK_PRODUCTS.map((item) => (
              <View
                key={item.id}
                style={{
                  width: (width - (SECTION_PADDING * 2) - ITEM_SPACING) / 2,
                  marginBottom: ITEM_SPACING
                }}
              >
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item)}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
