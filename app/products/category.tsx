import { categoryApi } from '@/api/categoryApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { StoreStatusBanner } from '@/components/StoreStatusBanner';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { mapApiProductsToUiProducts } from '@/utils/productHelper';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const PADDING_HORIZONTAL = 16;
const ITEM_SPACING = 12;
const CARD_WIDTH = Math.floor((width - (PADDING_HORIZONTAL * 2) - ITEM_SPACING) / 2);

export default function CategoryScreen() {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const { settings } = useCart();
  const [sortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [viewMode] = useState<'grid' | 'list'>('grid');

  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryProducts();
  }, [categoryName]);

  const loadCategoryProducts = async () => {
    if (!categoryName) return;
    setLoading(true);
    setError(null);
    try {
      const response = await categoryApi.getProductsByCategory(categoryName);
      if (response.success && response.data) {
        setProducts(mapApiProductsToUiProducts(response.data));
      } else {
        setError(response.message || 'No products found in this category');
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });
  }, [products, sortBy]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <PageHeader title={categoryName || 'Category'} variant="primary" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title={categoryName || 'Category'} variant="primary" />
      <StoreStatusBanner storeStatus={settings?.storeStatus} />

      {/* Modern Products Grid */}
      {sortedProducts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: PADDING_HORIZONTAL }}>
          <View style={{
            backgroundColor: Colors.textWhite,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.gray200,
            width: '100%',
          }}>
            <View style={{
              backgroundColor: Colors.gray100,
              borderRadius: 60,
              padding: 20,
              marginBottom: 16,
            }}>
              <Icon name={Icons.orders.name} size={48} color={Colors.textSecondary} library={Icons.orders.library} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 }}>
              {error || 'No products found'}
            </Text>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 14 }}>
              Try exploring other categories
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL, paddingTop: 12, paddingBottom: 32 }}
          columnWrapperStyle={viewMode === 'grid' ? { gap: ITEM_SPACING, marginBottom: 12 } : undefined}
          renderItem={({ item }) => (
            <View style={{ width: viewMode === 'grid' ? CARD_WIDTH : '100%' }}>
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
