import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { mapApiProductsToUiProducts } from '@/utils/productHelper';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;
const NUM_COLUMNS = 4;
const TILE_SIZE = Math.floor((width - 40 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS);

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
        // Show featured products
        setProducts(mapApiProductsToUiProducts(productsRes.data).slice(0, 10));
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
      params: { categoryId: (category as any)._id || category.id, categoryName: category.name },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title="Explore" showBackButton={false} variant="primary" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: SECTION_PADDING, paddingTop: 16, paddingBottom: 8 }}>
          <TouchableOpacity
            onPress={() => router.push('/products/search')}
            activeOpacity={0.9}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 5,
              paddingHorizontal: 16,
              height: 48,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <Icon name="search" size={20} color={Colors.textTertiary} library="material" />
            <Text style={{ marginLeft: 12, color: Colors.textTertiary, fontSize: 14, fontWeight: '500' }}>
              Search for products, brands...
            </Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={{ padding: SECTION_PADDING }}>
            <View style={{ marginBottom: 24 }}>
              <SkeletonLoader width={120} height={24} style={{ marginBottom: 20 }} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <View key={i} style={{ width: TILE_SIZE, marginBottom: 16, alignItems: 'center' }}>
                    <SkeletonLoader width={TILE_SIZE} height={TILE_SIZE} borderRadius={5} />
                    <SkeletonLoader width="80%" height={12} style={{ marginTop: 8 }} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Categories Section */}
            <View style={{ marginTop: 12, paddingHorizontal: SECTION_PADDING }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 }}>
                  Categories
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: 8,
              }}>
                {categories.map((category, index) => (
                  <View key={(category as any)._id || category.id || index} style={{ marginBottom: 16 }}>
                    <CategoryTile
                      name={category.name}
                      image={typeof category.image === 'string' ? category.image : (category.image as any)?.url}
                      icon={(category as any).icon}
                      size={TILE_SIZE}
                      onPress={() => handleCategoryPress(category)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Featured Products Section */}
            {products.length > 0 && (
              <View style={{ marginTop: 12, paddingHorizontal: SECTION_PADDING }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>
                    Featured Products
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  gap: 12,
                }}>
                  {products.map((item) => (
                    <View key={item.id} style={{
                      width: Math.floor((width - (SECTION_PADDING * 2) - 12) / 2),
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
        )}
      </ScrollView>
    </View>
  );
}
