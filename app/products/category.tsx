import { categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { Product } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Platform, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;

// Reusing mapping function
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
    categoryId: apiProduct.category,
    brandId: apiProduct.brand,
    brand: apiProduct.brand,
    category: apiProduct.category,
    inStock: apiProduct.stock > 0 && apiProduct.isActive,
    stockQuantity: apiProduct.stock,
    unit: apiProduct.unitType || 'unit',
    minQuantity: apiProduct.minimumQuantity || 1,
    maxQuantity: 10,
    rating: 4.5,
    reviewCount: 0,
    ingredients: [],
    nutrition: undefined
  };
};

export default function CategoryScreen() {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
        setProducts(response.data.map(mapApiProductToUiProduct));
      } else {
        setError(response.message || 'No products found in this category');
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader title={categoryName || 'Category'} variant="primary" />

      {/* Modern Products */}
      {sortedProducts.length === 0 ? (
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
                {error || 'No products found'}
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 15, fontWeight: '400' }}>
                Try exploring other categories
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={sortedProducts}
            numColumns={viewMode === 'grid' ? 2 : 1}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SECTION_PADDING, paddingTop: headerHeight + 20, paddingBottom: 24 }}
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
