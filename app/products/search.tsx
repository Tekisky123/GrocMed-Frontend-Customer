import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Animated } from 'react-native';
import { router } from 'expo-router';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Icon, Icons } from '@/components/ui/Icon';
import { Product } from '@/types';
import { Colors } from '@/constants/colors';

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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Modern Search Header */}
      <Animated.View style={{ 
        opacity: fadeAnim,
        backgroundColor: Colors.primary, 
        paddingTop: 50, 
        paddingBottom: 16, 
        paddingHorizontal: SECTION_PADDING,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Icon name={Icons.back.name} size={20} color={Colors.textWhite} library={Icons.back.library} />
          </TouchableOpacity>
          <View style={{
            flex: 1,
            backgroundColor: Colors.textWhite,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Icon name={Icons.search.name} size={18} color={Colors.textSecondary} library={Icons.search.library} />
            <TextInput
              placeholder="Search for products, brands and more"
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ 
                flex: 1, 
                color: Colors.textPrimary, 
                fontSize: 14, 
                marginLeft: 8,
                fontWeight: '400',
              }}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')} 
                activeOpacity={0.7}
              >
                <Icon name={Icons.close.name} size={16} color={Colors.textSecondary} library={Icons.close.library} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Professional Filters Section */}
        <Animated.View style={{ paddingTop: 20, paddingHorizontal: SECTION_PADDING, opacity: fadeAnim }}>
          {/* Category Filters */}
          <GlassCard
            variant="default"
            style={{
              backgroundColor: Colors.glassMedium,
              marginBottom: 16,
              padding: 0,
            }}
            padding={18}
          >
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>
                Filter by Category
              </Text>
              <View style={{
                width: 45,
                height: 3,
                backgroundColor: Colors.primary,
                borderRadius: 2,
              }} />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingRight: 4 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.8}
                style={{
                  marginRight: ITEM_SPACING,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: selectedCategory === null ? Colors.primary : Colors.glassLight,
                  borderWidth: selectedCategory === null ? 0 : 1.5,
                  borderColor: Colors.border,
                  shadowColor: selectedCategory === null ? Colors.primary : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedCategory === null ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: selectedCategory === null ? 4 : 0,
                }}
              >
                <Text style={{
                  fontWeight: '800',
                  fontSize: 12,
                  letterSpacing: 0.2,
                  color: selectedCategory === null ? Colors.textWhite : Colors.textSecondary,
                }}>
                  All
                </Text>
              </TouchableOpacity>
              {MOCK_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.8}
                  style={{
                    marginRight: ITEM_SPACING,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: selectedCategory === category.id ? Colors.primary : Colors.glassLight,
                    borderWidth: selectedCategory === category.id ? 0 : 1.5,
                    borderColor: Colors.border,
                    shadowColor: selectedCategory === category.id ? Colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedCategory === category.id ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: selectedCategory === category.id ? 4 : 0,
                  }}
                >
                  <Text style={{
                    fontWeight: '800',
                    fontSize: 12,
                    letterSpacing: 0.2,
                    color: selectedCategory === category.id ? Colors.textWhite : Colors.textSecondary,
                  }}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassCard>

          {/* Brand Filters */}
          <GlassCard
            variant="default"
            style={{
              backgroundColor: Colors.glassMedium,
              marginBottom: 20,
              padding: 0,
            }}
            padding={18}
          >
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>
                Filter by Brand
              </Text>
              <View style={{
                width: 45,
                height: 3,
                backgroundColor: Colors.accent,
                borderRadius: 2,
              }} />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingRight: 4 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedBrand(null)}
                activeOpacity={0.8}
                style={{
                  marginRight: ITEM_SPACING,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: selectedBrand === null ? Colors.accent : Colors.glassLight,
                  borderWidth: selectedBrand === null ? 0 : 1.5,
                  borderColor: Colors.border,
                  shadowColor: selectedBrand === null ? Colors.accent : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedBrand === null ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: selectedBrand === null ? 4 : 0,
                }}
              >
                <Text style={{
                  fontWeight: '800',
                  fontSize: 12,
                  letterSpacing: 0.2,
                  color: selectedBrand === null ? Colors.textWhite : Colors.textSecondary,
                }}>
                  All
                </Text>
              </TouchableOpacity>
              {MOCK_BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  onPress={() => setSelectedBrand(brand.id)}
                  activeOpacity={0.8}
                  style={{
                    marginRight: ITEM_SPACING,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: selectedBrand === brand.id ? Colors.accent : Colors.glassLight,
                    borderWidth: selectedBrand === brand.id ? 0 : 1.5,
                    borderColor: Colors.border,
                    shadowColor: selectedBrand === brand.id ? Colors.accent : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedBrand === brand.id ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: selectedBrand === brand.id ? 4 : 0,
                  }}
                >
                  <Text style={{
                    fontWeight: '800',
                    fontSize: 12,
                    letterSpacing: 0.2,
                    color: selectedBrand === brand.id ? Colors.textWhite : Colors.textSecondary,
                  }}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassCard>
        </Animated.View>

        {/* Professional Results Section */}
        <Animated.View style={{ paddingHorizontal: SECTION_PADDING, paddingBottom: 24, opacity: fadeAnim }}>
          <GlassCard
            variant="elevated"
            style={{
              backgroundColor: Colors.glassHeavy,
              marginBottom: 18,
              padding: 0,
            }}
            padding={18}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 4 }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </Text>
                <View style={{
                  width: 45,
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name={Icons.close.name} size={14} color={Colors.error} library={Icons.close.library} />
                  <Text style={{ color: Colors.error, fontWeight: '700', fontSize: 12, marginLeft: 5, letterSpacing: 0.2 }}>
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>

          {filteredProducts.length === 0 ? (
            <GlassCard
              variant="elevated"
              style={{
                alignItems: 'center',
                backgroundColor: Colors.glassHeavy,
                padding: 0,
              }}
              padding={36}
            >
              <View style={{ 
                backgroundColor: `${Colors.primary}15`, 
                borderRadius: 70, 
                padding: 32, 
                marginBottom: 24,
                borderWidth: 3,
                borderColor: `${Colors.primary}25`,
              }}>
                <Icon name={Icons.search.name} size={70} color={Colors.primary} library={Icons.search.library} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center', letterSpacing: -0.3 }}>
                No products found
              </Text>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 16, lineHeight: 22, fontWeight: '500' }}>
                Try adjusting your search or filters
              </Text>
            </GlassCard>
          ) : (
            <FlatList
              data={filteredProducts}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: ITEM_SPACING / 2 }}
              renderItem={({ item }) => {
                const { width } = require('react-native').Dimensions.get('window');
                return (
                  <View style={{ width: (width - (SECTION_PADDING * 2) - ITEM_SPACING) / 2, marginBottom: 16 }}>
                    <ProductCard
                      product={item}
                      onPress={() => handleProductPress(item)}
                    />
                  </View>
                );
              }}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
