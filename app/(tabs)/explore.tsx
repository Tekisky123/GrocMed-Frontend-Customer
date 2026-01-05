import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 16; // Standardized to 16px
const ITEM_SPACING = 12;

// Robust mapping function consistent with other pages
const mapApiProductToUiProduct = (apiProduct: ApiProduct): Product => {
  const discount = apiProduct.mrp && apiProduct.offerPrice
    ? Math.round(((apiProduct.mrp - apiProduct.offerPrice) / apiProduct.mrp) * 100)
    : 0;

  return {
    id: apiProduct._id,
    name: apiProduct.name,
    description: apiProduct.description,
    price: apiProduct.offerPrice || apiProduct.mrp,
    originalPrice: apiProduct.offerPrice ? apiProduct.mrp : undefined,
    discount: discount > 0 ? discount : undefined,
    image: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images[0] : '',
    images: apiProduct.images,
    categoryId: apiProduct.category,
    brandId: apiProduct.brand,
    brand: apiProduct.brand,
    category: apiProduct.category,
    inStock: apiProduct.stock > 0 && apiProduct.isActive,
    stockQuantity: apiProduct.stock,
    unit: apiProduct.unitType || 'unit',
    minQuantity: apiProduct.minimumQuantity || 1,
    maxQuantity: 10,
    rating: 4.5, // Placeholder
    reviewCount: 127, // Placeholder
    ingredients: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    manfDate: apiProduct.manfDate,
    expiryDate: apiProduct.expiryDate,
  };
};

export default function ExploreScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // API State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryApi.getAllCategories(),
        productApi.getAllProducts(),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (productsRes.success && productsRes.data) {
        // Show featured products (random selection for explore)
        setProducts(productsRes.data.map(mapApiProductToUiProduct).slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading explore data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/products/category',
      params: { categoryName: category.name },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={{
          paddingHorizontal: SECTION_PADDING,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: Colors.background,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.05)'
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: Colors.textPrimary,
            marginBottom: 16
          }}>
            Explore
          </Text>

          {/* Search Bar - Consistent with Home */}
          <TouchableOpacity
            onPress={() => router.push('/products/search')}
            activeOpacity={0.9}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6', // Lighter background like standard search bars
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 52,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.03)',
            }}
          >
            <Icon name="search" size={22} color={Colors.textTertiary} library="material" />
            <Text style={{ marginLeft: 12, color: Colors.textTertiary, fontSize: 15, fontWeight: '500' }}>
              Search for products, brands...
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Categories Section */}
            <View style={{ marginTop: 24, paddingHorizontal: SECTION_PADDING }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary }}>
                  Categories
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {categories.map((category, index) => {
                  // 3 Columns Grid
                  const cardWidth = (width - (SECTION_PADDING * 2) - (ITEM_SPACING * 2)) / 3;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.7}
                      style={{
                        width: cardWidth,
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <View style={{
                        width: cardWidth,
                        height: cardWidth,
                        backgroundColor: '#fff',
                        borderRadius: 20, // More rounded modern look
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 6,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor: Colors.gray100
                      }}>
                        {category.image ? (
                          <Image
                            source={{ uri: category.image }}
                            style={{ width: '60%', height: '60%' }}
                            resizeMode="contain"
                          />
                        ) : (
                          <Icon name="category" size={32} color={Colors.primary} library="material" />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          textAlign: 'center',
                          color: Colors.textPrimary,
                          fontWeight: '700',
                          lineHeight: 16,
                        }}
                        numberOfLines={2}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Featured Products Section */}
            {products.length > 0 && (
              <View style={{ marginTop: 12, paddingHorizontal: SECTION_PADDING }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary }}>
                    Featured Products
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                  {products.map((item) => (
                    <View key={item.id} style={{
                      width: (width - (SECTION_PADDING * 2) - ITEM_SPACING) / 2,
                      marginBottom: 16,
                    }}>
                      <ProductCard
                        product={item}
                        onPress={() => handleProductPress(item.id)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
