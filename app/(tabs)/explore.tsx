import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_PRODUCTS } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon, Icons } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';

const { width } = Dimensions.get('window');
const SECTION_PADDING = 20;
const ITEM_SPACING = 12;

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    return true;
  });

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/products/[id]',
      params: { id: productId },
    });
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: '/products/category',
      params: { categoryId, categoryName },
    });
  };

  const headerHeight = Platform.OS === 'ios' ? 140 : 120;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PageHeader 
        title="Explore" 
        variant="primary"
        subtitle="Discover products by category and brand"
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 24 }}
      >

        {/* Modern Categories Grid - 4 Columns */}
        <Animated.View style={{ marginBottom: 28, paddingHorizontal: SECTION_PADDING, opacity: fadeAnim }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 22, 
              fontWeight: '700', 
              color: Colors.textPrimary,
              letterSpacing: -0.3,
              marginBottom: 4,
            }}>
              Shop by Category
            </Text>
            <View style={{
              width: 50,
              height: 3,
              backgroundColor: Colors.primary,
              borderRadius: 2,
            }} />
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
                  onPress={() => handleCategoryPress(category.id, category.name)}
                  activeOpacity={0.75}
                  style={{ 
                    width: cardWidth,
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <View style={{
                    width: cardWidth - 6,
                    height: cardWidth - 6,
                    backgroundColor: Colors.textWhite,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    borderWidth: 1.5,
                    borderColor: Colors.gray200,
                    shadowColor: Colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                    <View style={{
                      backgroundColor: `${Colors.primary}10`,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: `${Colors.primary}20`,
                    }}>
                      <Icon 
                        name={categoryIcon.name} 
                        size={26} 
                        color={Colors.primary} 
                        library={categoryIcon.library} 
                      />
                    </View>
                  </View>
                  <Text 
                    style={{ 
                      fontSize: 12, 
                      textAlign: 'center', 
                      color: Colors.textPrimary,
                      fontWeight: '600',
                      lineHeight: 16,
                      letterSpacing: 0.1,
                    }}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                  {category.productCount > 0 && (
                    <Text 
                      style={{ 
                        fontSize: 10, 
                        textAlign: 'center', 
                        color: Colors.textTertiary,
                        fontWeight: '500',
                        marginTop: 2,
                      }}
                    >
                      {category.productCount} items
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Modern Products Grid */}
        {filteredProducts.length > 0 && (
          <Animated.View style={{ paddingHorizontal: SECTION_PADDING, paddingTop: 8, opacity: fadeAnim }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ 
                fontSize: 22, 
                fontWeight: '700', 
                color: Colors.textPrimary,
                letterSpacing: -0.3,
              }}>
                {selectedCategory ? 'Filtered Products' : 'Featured Products'}
              </Text>
            </View>
            <FlatList
              data={filteredProducts.slice(0, 6)}
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
                    onPress={() => handleProductPress(item.id)}
                  />
                </View>
              )}
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
