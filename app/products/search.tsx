import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { MOCK_BRANDS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/constants/mockData';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Dimensions, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;
const ITEM_SPACING = 12;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredProducts = useMemo(() => {
    let products = MOCK_PRODUCTS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }

    if (selectedBrand) {
      products = products.filter((p) => p.brandId === selectedBrand);
    }

    return products;
  }, [searchQuery, selectedCategory, selectedBrand]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Modern Clean Header - Matching PageHeader container style */}
      <View style={{
        backgroundColor: Colors.background,
        paddingTop: statusBarHeight + 16,
        paddingBottom: 22,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
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
              elevation: 2,
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
            elevation: 2,
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
          <View style={{ marginBottom: 28 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: Colors.textPrimary,
                letterSpacing: -0.3,
                marginBottom: 4,
              }}>
                Filter Products
              </Text>
              <View style={{
                width: 50,
                height: 3,
                backgroundColor: Colors.primary,
                borderRadius: 2,
              }} />
            </View>

            {/* Categories */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12 }}>
                By Category
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
                {MOCK_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    activeOpacity={0.7}
                    style={{
                      marginRight: 10,
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 25,
                      backgroundColor: selectedCategory === category.id ? Colors.primary : Colors.surface,
                      borderWidth: 1,
                      borderColor: selectedCategory === category.id ? Colors.primary : Colors.border,
                    }}
                  >
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 13,
                      color: selectedCategory === category.id ? '#FFF' : Colors.textPrimary,
                    }}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Brands */}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12 }}>
                By Brand
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedBrand(null)}
                  activeOpacity={0.7}
                  style={{
                    marginRight: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 25,
                    backgroundColor: selectedBrand === null ? Colors.accent : Colors.surface,
                    borderWidth: 1,
                    borderColor: selectedBrand === null ? Colors.accent : Colors.border,
                  }}
                >
                  <Text style={{
                    fontWeight: '600',
                    fontSize: 13,
                    color: selectedBrand === null ? '#FFF' : Colors.textPrimary,
                  }}>
                    All
                  </Text>
                </TouchableOpacity>
                {MOCK_BRANDS.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    onPress={() => setSelectedBrand(brand.id)}
                    activeOpacity={0.7}
                    style={{
                      marginRight: 10,
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 25,
                      backgroundColor: selectedBrand === brand.id ? Colors.accent : Colors.surface,
                      borderWidth: 1,
                      borderColor: selectedBrand === brand.id ? Colors.accent : Colors.border,
                    }}
                  >
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 13,
                      color: selectedBrand === brand.id ? '#FFF' : Colors.textPrimary,
                    }}>
                      {brand.name}
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
                Results
              </Text>
              <View style={{
                width: 50,
                height: 3,
                backgroundColor: Colors.primary,
                borderRadius: 2,
              }} />
            </View>

            {(selectedCategory || selectedBrand || searchQuery) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
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

          {/* Product Grid - Matching Explore Screen Exact Dimensions */}
          <View style={{ paddingBottom: 40 }}>
            {filteredProducts.length === 0 ? (
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
                  No matches found
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
                  Try checking your spelling or changing filters
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
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
