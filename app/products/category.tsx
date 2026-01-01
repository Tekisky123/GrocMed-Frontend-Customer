import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions, Animated, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Product } from '@/types';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;

export default function CategoryScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const category = MOCK_CATEGORIES.find((c) => c.id === categoryId);
  let products = MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId);

  // Sort products
  products = [...products].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.name.localeCompare(b.name);
  });

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const headerHeight = Platform.OS === 'ios' ? 120 : 100;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title={categoryName || category?.name || 'Category'} variant="primary" />

      {/* Modern Filters */}
      <Animated.View style={{ 
        opacity: fadeAnim,
        marginHorizontal: SECTION_PADDING,
        marginBottom: 16,
        marginTop: headerHeight + 16,
      }}>
        <View style={{
          backgroundColor: Colors.textWhite,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: Colors.gray200,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['price', 'rating', 'name'] as const).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  onPress={() => setSortBy(sort)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: sortBy === sort ? Colors.primary : Colors.gray100,
                    borderWidth: sortBy === sort ? 0 : 1.5,
                    borderColor: Colors.gray200,
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '800',
                    letterSpacing: 0.3,
                    color: sortBy === sort ? Colors.textWhite : Colors.textSecondary,
                  }}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.gray100,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: Colors.gray200,
              }}
            >
              <Icon 
                name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
                size={22} 
                color={Colors.textPrimary} 
                library="material" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Modern Products */}
      {products.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SECTION_PADDING }}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={{
              backgroundColor: Colors.textWhite,
              borderRadius: 12,
              padding: 40,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.gray200,
            }}>
              <View style={{ 
                backgroundColor: Colors.gray100,
                borderRadius: 60, 
                padding: 24, 
                marginBottom: 20,
              }}>
                <Icon name={Icons.orders.name} size={60} color={Colors.textSecondary} library={Icons.orders.library} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 }}>
                No products found
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 15, fontWeight: '400' }}>
                This category is empty
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={products}
            numColumns={viewMode === 'grid' ? 2 : 1}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SECTION_PADDING, paddingTop: 0, paddingBottom: 24 }}
            columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between', gap: 12 } : undefined}
            renderItem={({ item }) => (
              <View style={{ 
                width: viewMode === 'grid' ? (width - (SECTION_PADDING * 2) - 12) / 2 : '100%', 
                marginBottom: 20 
              }}>
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item)}
                />
              </View>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}
