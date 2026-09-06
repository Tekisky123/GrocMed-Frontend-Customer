import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { StoreStatusBanner } from '@/components/StoreStatusBanner';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { mapApiProductsToUiProducts } from '@/utils/productHelper';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 16;
const ITEM_SPACING = 12;

const CARD_WIDTH = Math.floor((width - (SECTION_PADDING * 2) - ITEM_SPACING) / 2);

export default function SearchScreen() {
  const { settings } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
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
        setProducts(mapApiProductsToUiProducts(response.data));
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
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;

  const renderHeader = () => (
    <View style={{ paddingHorizontal: SECTION_PADDING, paddingTop: 16 }}>
      {/* Filters Section */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 }}>
          Filter by Category
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ name: 'All' }, ...categories]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
              const isAll = index === 0;
              const isSelected = isAll ? selectedCategory === null : selectedCategory === item.name;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(isAll ? null : item.name)}
                  activeOpacity={0.7}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 5,
                    backgroundColor: isSelected ? Colors.primary : Colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{
                    fontWeight: '700',
                    fontSize: 12,
                    color: isSelected ? '#FFF' : Colors.textPrimary,
                  }}>
                    {isAll ? 'All' : item.name}
                  </Text>
                </TouchableOpacity>
              );
          }}
        />
      </View>

      {/* Results Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
      }}>
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: Colors.textPrimary,
            letterSpacing: -0.3,
            marginBottom: 4,
          }}>
            Results {products.length > 0 && `(${products.length})`}
          </Text>
          <View style={{
            width: 40,
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.error }}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (searching) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        opacity: 0.8
      }}>
        <View style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.gray100,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Icon name={Icons.search.name} size={30} color={Colors.textTertiary} library={Icons.search.library} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>
          {searchQuery || selectedCategory ? 'No matches found' : 'Start searching...'}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center' }}>
          {searchQuery || selectedCategory ? 'Try checking your spelling or changing filters' : 'Find your favorite products'}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Search Header */}
      <View style={{
        backgroundColor: Colors.background,
        paddingTop: statusBarHeight + 12,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        zIndex: 1000,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 5,
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Icon name={Icons.back.name} size={22} color={Colors.textPrimary} library={Icons.back.library} />
          </TouchableOpacity>
          <View style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 5,
            paddingHorizontal: 12,
            height: 42,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
          }}>
            <Icon name={Icons.search.name} size={18} color={Colors.textTertiary} library={Icons.search.library} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: Colors.textPrimary,
                fontSize: 14,
                marginLeft: 8,
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

      <StoreStatusBanner storeStatus={settings?.storeStatus} />

      <FlatList
        data={products}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={false}
        columnWrapperStyle={{ 
            gap: ITEM_SPACING,
            paddingHorizontal: SECTION_PADDING,
            marginBottom: 12 
        }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
            />
          </View>
        )}
      />
    </View>
  );
}
