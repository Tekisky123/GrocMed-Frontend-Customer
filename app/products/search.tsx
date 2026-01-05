import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;
const ITEM_SPACING = 12;

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Load categories for filter
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (e) {
      console.error("Failed to load categories for search filter", e);
    }
  };

  // Debounced search function
  const performSearch = async (query: string, category: string | null) => {
    if (!query && !category) {
      setProducts([]);
      return;
    }

    setSearching(true);
    try {
      const response = await productApi.searchProducts(query, category || undefined);
      if (response.success && response.data) {
        setProducts(response.data.map(mapApiProductToUiProduct));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Search failed", error);
      setProducts([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedCategory) {
        performSearch(searchQuery, selectedCategory);
      } else {
        setProducts([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Search Header */}
      <View style={{
        backgroundColor: Colors.background,
        paddingTop: statusBarHeight + 16,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        // elevation: 4,
        zIndex: 1000,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }}
          >
            <Icon name={Icons.back.name} size={24} color={Colors.textPrimary} library={Icons.back.library} />
          </TouchableOpacity>
          <View style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            // elevation: 2,
          }}>
            <Icon name={Icons.search.name} size={20} color={Colors.textTertiary} library={Icons.search.library} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: Colors.textPrimary,
                fontSize: 15,
                marginLeft: 10,
                fontWeight: '500',
              }}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <Icon name={Icons.closeCircle.name} size={18} color={Colors.textTertiary} library={Icons.closeCircle.library} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, paddingTop: 28, opacity: fadeAnim }}>

          {/* Filters Section */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12 }}>
                Filter by Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCategory(null)}
                  activeOpacity={0.7}
                  style={{
                    marginRight: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 25,
                    backgroundColor: selectedCategory === null ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: selectedCategory === null ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{
                    fontWeight: '600',
                    fontSize: 13,
                    color: selectedCategory === null ? '#FFF' : Colors.textPrimary,
                  }}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedCategory(category.name)}
                    activeOpacity={0.7}
                    style={{
                      marginRight: 10,
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 25,
                      backgroundColor: selectedCategory === category.name ? Colors.primary : Colors.surface,
                      borderWidth: 1,
                      borderColor: selectedCategory === category.name ? Colors.primary : Colors.border,
                    }}
                  >
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 13,
                      color: selectedCategory === category.name ? '#FFF' : Colors.textPrimary,
                    }}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Results Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 20,
          }}>
            <View>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: Colors.textPrimary,
                letterSpacing: -0.3,
                marginBottom: 4,
              }}>
                Results {products.length > 0 && `(${products.length})`}
              </Text>
              <View style={{
                width: 50,
                height: 3,
                backgroundColor: Colors.primary,
                borderRadius: 2,
              }} />
            </View>

            {(selectedCategory || searchQuery) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.error }}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Grid */}
          <View style={{ paddingBottom: 40 }}>
            {searching ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : products.length === 0 ? (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 40,
                opacity: 0.8
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon name={Icons.search.name} size={32} color={Colors.textTertiary} library={Icons.search.library} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 }}>
                  {searchQuery || selectedCategory ? 'No matches found' : 'Start searching...'}
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
                  {searchQuery || selectedCategory ? 'Try checking your spelling or changing filters' : 'Find your favorite products'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={products}
                numColumns={2}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <View style={{
                    width: (width - (SECTION_PADDING * 2) - ITEM_SPACING) / 2,
                    marginBottom: 20,
                  }}>
                    <ProductCard
                      product={item}
                      onPress={() => handleProductPress(item)}
                    />
                  </View>
                )}
              />
            )}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}
