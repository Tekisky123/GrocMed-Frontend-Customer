import { Product, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use the public API to get all products
      const response = await productApi.getAllProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        // Only show alert if it's a real error, not just empty
        if (response.message) {
          console.log('Failed to load products:', response.message);
        }
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>View available product inventory</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={Colors.textSecondary} library="material" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Icon name="close" size={18} color={Colors.textSecondary} library="material" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category || (category === 'All' && !selectedCategory) ? styles.categoryChipActive : null,
              ]}
              onPress={() => setSelectedCategory(category === 'All' ? null : category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category || (category === 'All' && !selectedCategory) ? styles.categoryChipTextActive : null,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="inventory" size={64} color={Colors.textTertiary} library="material" />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <View key={product._id} style={styles.productCard}>
                    <View style={styles.productImageContainer}>
                      {product.images && product.images.length > 0 ? (
                        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                      ) : (
                        <View style={styles.productImagePlaceholder}>
                          <Icon name="image" size={24} color={Colors.textTertiary} library="material" />
                        </View>
                      )}
                      {!product.isActive && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveText}>Inactive</Text>
                        </View>
                      )}
                      {product.stock === 0 && (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.productCategory}>{product.category}</Text>
                      <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>₹{product.price}</Text>
                        {product.stock > 0 && (
                          <Text style={styles.stockText}>{product.stock} in stock</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.textWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  productsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  productCard: {
    width: '47%', // 2 columns roughly
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 2,
    marginBottom: 8,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '600',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  stockText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
