import { GlassCard } from '@/components/ui/GlassCard';
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
          backgroundColor: Colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Top Row: GrocMed and Cart */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          {/* GrocMed Logo/Name */}
          <View>
            <Text style={{ 
              color: Colors.textWhite, 
              fontSize: 28, 
              fontWeight: '800', 
              letterSpacing: 1.5,
            }}>
              GrocMed
            </Text>
          </View>

          {/* Cart Icon */}
          <View>
            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={{ 
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 10,
              }}
              activeOpacity={0.8}
            >
              <Icon name={Icons.cart.name} size={24} color={Colors.textWhite} library={Icons.cart.library} />
              {cartItemCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: Colors.error,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: Colors.primary,
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
            backgroundColor: Colors.textWhite,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Icon name={Icons.search.name} size={20} color={Colors.textSecondary} library={Icons.search.library} />
            <Text style={{ 
              color: Colors.textTertiary, 
              fontSize: 15, 
              flex: 1, 
              marginLeft: 12,
              fontWeight: '400',
            }}>
              Search for products, brands and more
            </Text>
            <Icon name="mic" size={20} color={Colors.textSecondary} library="material" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Enhanced Banners - Consistent Alignment */}
        <Animated.View style={{ marginTop: 28, marginBottom: 32, opacity: fadeAnim }}>
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
                activeOpacity={0.9}
              >
                <View style={{ marginHorizontal: SECTION_PADDING }}>
                  <GlassCard
                    variant="elevated"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      backgroundColor: Colors.glassMedium,
                    }}
                    padding={0}
                  >
        <Image
                      source={{ uri: item.image }}
                      style={{ 
                        width: '100%', 
                        height: 220,
                      }}
                      resizeMode="cover"
                    />
                  </GlassCard>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            {MOCK_BANNERS.map((_, index) => (
              <Animated.View
                key={index}
                style={{
                  height: 10,
                  borderRadius: 5,
                  width: index === bannerIndex ? 40 : 10,
                  backgroundColor: index === bannerIndex ? Colors.primary : 'rgba(229, 231, 235, 0.6)',
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Modern Category Grid */}
        <Animated.View style={{ marginBottom: 24, paddingHorizontal: SECTION_PADDING, opacity: fadeAnim }}>
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
                  Mega Deals
                </Text>
                <View style={{
                  width: 60,
                  height: 4,
                  backgroundColor: Colors.error,
                  borderRadius: 2,
                  marginTop: 8,
                }} />
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/products/search')} 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: `${Colors.error}15`,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 15, marginRight: 6 }}>
                  See All
                </Text>
                <Icon name={Icons.arrowForward.name} size={18} color={Colors.error} library={Icons.arrowForward.library} />
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

        {/* Top Rated Products */}
        {topRated.length > 0 && (
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
                  Top Rated
                </Text>
                <View style={{
                  width: 60,
                  height: 4,
                  backgroundColor: Colors.warning,
                  borderRadius: 2,
                  marginTop: 8,
                }} />
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/products/search')} 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: `${Colors.warning}15`,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: Colors.warning, fontWeight: '700', fontSize: 15, marginRight: 6 }}>
                  See All
                </Text>
                <Icon name={Icons.arrowForward.name} size={18} color={Colors.warning} library={Icons.arrowForward.library} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={topRated}
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

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
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
                  New Arrivals
                </Text>
                <View style={{
                  width: 60,
                  height: 4,
                  backgroundColor: Colors.success,
                  borderRadius: 2,
                  marginTop: 8,
                }} />
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/products/search')} 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: `${Colors.success}15`,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 15, marginRight: 6 }}>
                  See All
                </Text>
                <Icon name={Icons.arrowForward.name} size={18} color={Colors.success} library={Icons.arrowForward.library} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={newArrivals}
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

        {/* Enhanced Featured Products - Consistent Alignment */}
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
          <FlatList
            data={featuredProducts}
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
          
          {/* Modern Uniform Grid Layout - 2 Columns */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: ITEM_SPACING }}>
            {/* Left Column */}
            <View style={{ flex: 1, gap: ITEM_SPACING }}>
              {MOCK_PRODUCTS.filter((_, index) => index % 2 === 0).slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleProductPress(item)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 18,
                    padding: 0,
                    overflow: 'hidden',
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                    shadowColor: Colors.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View style={{
                    backgroundColor: Colors.gray100,
                    height: 170,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '85%', height: '85%' }}
                      resizeMode="contain"
                    />
                    {item.discount && (
                      <View style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: Colors.error,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        shadowColor: Colors.error,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}>
                        <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>
                          {item.discount}% OFF
                        </Text>
                      </View>
                    )}
                    {!item.inStock && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <View style={{
                          backgroundColor: Colors.surface,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}>
                          <Text style={{ color: Colors.textPrimary, fontWeight: '700', fontSize: 12 }}>
                            Out of Stock
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 14 }}>
                    <Text 
                      style={{ 
                        fontSize: 13, 
                        fontWeight: '600', 
                        color: Colors.textPrimary,
                        marginBottom: 8,
                        lineHeight: 18,
                        minHeight: 36,
                      }} 
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 }}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: `${Colors.success}15`,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6,
                        gap: 3,
                        borderWidth: 1,
                        borderColor: `${Colors.success}30`,
                      }}>
                        <Icon name={Icons.star.name} size={11} color={Colors.success} library={Icons.star.library} />
                        <Text style={{ color: Colors.success, fontSize: 11, fontWeight: '700' }}>
                          {item.rating}
                        </Text>
                      </View>
                      <Text style={{ color: Colors.textTertiary, fontSize: 10, fontWeight: '500' }}>
                        ({item.reviewCount})
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 14, gap: 6 }}>
                      <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 17, letterSpacing: -0.3 }}>
                        ₹{item.price}
                      </Text>
                      {item.originalPrice && (
                        <Text style={{ 
                          color: Colors.textTertiary, 
                          textDecorationLine: 'line-through', 
                          fontSize: 12, 
                          fontWeight: '500' 
                        }}>
                          ₹{item.originalPrice}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (item.inStock) {
                          addToCart(item, 1);
                        }
                      }}
                      disabled={!item.inStock}
                      style={{
                        paddingVertical: 11,
                        borderRadius: 10,
                        backgroundColor: item.inStock ? Colors.primary : Colors.gray300,
                        alignItems: 'center',
                        shadowColor: item.inStock ? Colors.primary : 'transparent',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        elevation: item.inStock ? 3 : 0,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 12,
                          letterSpacing: 0.3,
                          color: item.inStock ? Colors.textWhite : Colors.textSecondary,
                        }}
                      >
                        {item.inStock ? 'ADD TO CART' : 'NOTIFY ME'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Right Column */}
            <View style={{ flex: 1, gap: ITEM_SPACING }}>
              {MOCK_PRODUCTS.filter((_, index) => index % 2 === 1).slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleProductPress(item)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 18,
                    padding: 0,
                    overflow: 'hidden',
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                    shadowColor: Colors.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View style={{
                    backgroundColor: Colors.gray100,
                    height: 170,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '85%', height: '85%' }}
                      resizeMode="contain"
                    />
                    {item.discount && (
                      <View style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: Colors.error,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        shadowColor: Colors.error,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}>
                        <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>
                          {item.discount}% OFF
                        </Text>
                      </View>
                    )}
                    {!item.inStock && (
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <View style={{
                          backgroundColor: Colors.surface,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}>
                          <Text style={{ color: Colors.textPrimary, fontWeight: '700', fontSize: 12 }}>
                            Out of Stock
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 14 }}>
                    <Text 
                      style={{ 
                        fontSize: 13, 
                        fontWeight: '600', 
                        color: Colors.textPrimary,
                        marginBottom: 8,
                        lineHeight: 18,
                        minHeight: 36,
                      }} 
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 }}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: `${Colors.success}15`,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6,
                        gap: 3,
                        borderWidth: 1,
                        borderColor: `${Colors.success}30`,
                      }}>
                        <Icon name={Icons.star.name} size={11} color={Colors.success} library={Icons.star.library} />
                        <Text style={{ color: Colors.success, fontSize: 11, fontWeight: '700' }}>
                          {item.rating}
                        </Text>
                      </View>
                      <Text style={{ color: Colors.textTertiary, fontSize: 10, fontWeight: '500' }}>
                        ({item.reviewCount})
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 14, gap: 6 }}>
                      <Text style={{ color: Colors.textPrimary, fontWeight: '800', fontSize: 17, letterSpacing: -0.3 }}>
                        ₹{item.price}
                      </Text>
                      {item.originalPrice && (
                        <Text style={{ 
                          color: Colors.textTertiary, 
                          textDecorationLine: 'line-through', 
                          fontSize: 12, 
                          fontWeight: '500' 
                        }}>
                          ₹{item.originalPrice}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (item.inStock) {
                          addToCart(item, 1);
                        }
                      }}
                      disabled={!item.inStock}
                      style={{
                        paddingVertical: 11,
                        borderRadius: 10,
                        backgroundColor: item.inStock ? Colors.primary : Colors.gray300,
                        alignItems: 'center',
                        shadowColor: item.inStock ? Colors.primary : 'transparent',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        elevation: item.inStock ? 3 : 0,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 12,
                          letterSpacing: 0.3,
                          color: item.inStock ? Colors.textWhite : Colors.textSecondary,
                        }}
                      >
                        {item.inStock ? 'ADD TO CART' : 'NOTIFY ME'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
