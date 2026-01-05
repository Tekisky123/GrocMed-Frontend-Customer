import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Safe mapping function
const mapApiProductToUiProduct = (apiProduct: ApiProduct | null | undefined): Product | null => {
    if (!apiProduct || !apiProduct._id) return null;

    const discount = apiProduct.mrp && apiProduct.offerPrice
        ? Math.round(((apiProduct.mrp - apiProduct.offerPrice) / apiProduct.mrp) * 100)
        : 0;

    return {
        id: apiProduct._id,
        name: apiProduct.name || 'Unknown Product',
        description: apiProduct.description || '',
        price: apiProduct.offerPrice || apiProduct.mrp || 0,
        originalPrice: apiProduct.offerPrice ? apiProduct.mrp : undefined,
        discount: discount > 0 ? discount : undefined,
        image: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images[0] : 'https://via.placeholder.com/150',
        categoryId: apiProduct.category || '',
        brandId: apiProduct.brand || '',
        brand: apiProduct.brand || 'Unknown Brand',
        category: apiProduct.category || 'Uncategorized',
        inStock: (apiProduct.stock || 0) > 0 && !!apiProduct.isActive,
        stockQuantity: apiProduct.stock || 0,
        unit: apiProduct.unitType || 'unit',
        minQuantity: apiProduct.minimumQuantity || 1,
        maxQuantity: 10,
        rating: 4.5,
        reviewCount: 0,
        ingredients: [],
        nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        }
    };
};

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBanner, setCurrentBanner] = useState(0);

    const { getItemCount } = useCart();
    const { setCartIconPosition } = useCartAnimation();
    const scrollViewRef = useRef<ScrollView>(null);

    const banners = [
        {
            id: 1,
            title: 'Delivery in 4 Hours',
            subtitle: 'Fast & Reliable Service',
            color: '#4CAF50',
            tag: 'Express Delivery',
            description: 'Order now and get your groceries delivered within 4 hours'
        },
        {
            id: 2,
            title: 'Business to Business',
            subtitle: 'Wholesale Solutions',
            color: '#2196F3',
            tag: 'B2B Partner',
            description: 'Special pricing and bulk orders for businesses'
        },
        {
            id: 3,
            title: 'Quality Assured',
            subtitle: 'Fresh & Organic',
            color: '#FF9800',
            tag: 'Premium Quality',
            description: '100% quality guarantee on all fresh produce'
        },
    ];

    // Auto-slide banner
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => {
                const next = (prev + 1) % banners.length;
                scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        setError(null);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productApi.getAllProducts().catch(e => ({ success: false, data: [] as ApiProduct[], message: 'Failed to fetch products' })),
                categoryApi.getAllCategories().catch(e => ({ success: false, data: [] as Category[], message: 'Failed to fetch categories' })),
            ]);

            if (productsRes.success && Array.isArray(productsRes.data)) {
                const validProducts = productsRes.data
                    .map(mapApiProductToUiProduct)
                    .filter((p): p is Product => p !== null);
                setProducts(validProducts);
            } else {
                if (products.length === 0) setError('Unable to load products');
            }

            if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
                const validCategories = categoriesRes.data.filter(c => c && c.name);
                setCategories(validCategories);
            }
        } catch (err) {
            console.error('Error loading home data:', err);
            if (products.length === 0) setError('Failed to connect to server');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleProductPress = (product: Product) => {
        if (!product || !product.id) return;
        router.push({
            pathname: '/products/[id]',
            params: { id: product.id },
        });
    };

    const handleCategoryPress = (category: Category) => {
        if (!category || !category.name) return;
        router.push({
            pathname: '/products/category',
            params: { categoryName: category.name },
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
            {/* Header with Logo and Search */}
            <View style={{
                backgroundColor: Colors.background,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
            }}>
                {/* Logo and Cart Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Image
                        source={require('@/assets/images/logo-removebg-preview.png')}
                        style={{ width: 190, height: 70 }}
                        resizeMode="contain"
                    />

                    <TouchableOpacity
                        ref={(view) => {
                            view?.measureInWindow((x, y, width, height) => {
                                setCartIconPosition({ x, y, width, height });
                            });
                        }}
                        onPress={() => router.push('/(tabs)/cart')}
                        style={{
                            position: 'relative',
                            padding: 10,
                            backgroundColor: Colors.surface,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: Colors.border,
                        }}
                    >
                        <Icon name="shopping-cart" size={24} color={Colors.textPrimary} library="material" />
                        {getItemCount() > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                backgroundColor: Colors.error,
                                borderRadius: 10,
                                minWidth: 20,
                                height: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 4,
                                borderWidth: 2,
                                borderColor: Colors.background,
                            }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                                    {getItemCount() > 99 ? '99+' : getItemCount()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <TouchableOpacity
                    onPress={() => router.push('/products/search')}
                    activeOpacity={0.8}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Colors.surface,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        height: 48,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        shadowColor: Colors.shadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                    }}
                >
                    <Icon name={Icons.search.name} size={20} color={Colors.textTertiary} library={Icons.search.library} />
                    <Text style={{ marginLeft: 10, color: Colors.textTertiary, fontSize: 15, fontWeight: '500', flex: 1 }}>
                        Search for products...
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Auto-Sliding Banner */}
                <View style={{ marginTop: 16, marginBottom: 20 }}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                            setCurrentBanner(slideIndex);
                        }}
                        snapToInterval={width}
                        decelerationRate="fast"
                    >
                        {banners.map((banner, index) => (
                            <View
                                key={banner.id}
                                style={{
                                    width: width,
                                    paddingHorizontal: 16,
                                }}
                            >
                                <View style={{
                                    height: 210,
                                    backgroundColor: banner.color,
                                    borderRadius: 20,
                                    padding: 24,
                                    justifyContent: 'space-between',
                                    shadowColor: banner.color,
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 12,
                                    overflow: 'hidden',
                                }}>
                                    {/* Background Decorative Elements */}
                                    <View style={{
                                        position: 'absolute',
                                        right: -60,
                                        top: -60,
                                        width: 220,
                                        height: 220,
                                        borderRadius: 110,
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        right: 20,
                                        bottom: -40,
                                        width: 140,
                                        height: 140,
                                        borderRadius: 70,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    }} />

                                    {/* Content */}
                                    <View>
                                        <View style={{
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 8,
                                            alignSelf: 'flex-start',
                                            marginBottom: 12,
                                        }}>
                                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                                {banner.tag}
                                            </Text>
                                        </View>

                                        <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 8, lineHeight: 36 }}>
                                            {banner.title}
                                        </Text>
                                        <Text style={{ fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.95)', marginBottom: 8 }}>
                                            {banner.subtitle}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', lineHeight: 18 }}>
                                            {banner.description}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                        {banners.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: index === currentBanner ? 28 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: index === currentBanner ? Colors.primary : Colors.gray300,
                                }}
                            />
                        ))}
                    </View>
                </View>

                {/* Categories - Horizontal Scroll */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
                        <Text style={{ fontSize: 19, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 }}>Shop by Category</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                            <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
                        {categories.map((category, index) => {
                            if (!category) return null;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={{ alignItems: 'center', width: 75 }}
                                    onPress={() => handleCategoryPress(category)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{
                                        width: 75,
                                        height: 75,
                                        borderRadius: 38,
                                        backgroundColor: Colors.surface,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                        borderWidth: 1,
                                        borderColor: Colors.border,
                                        shadowColor: Colors.shadow,
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.12,
                                        shadowRadius: 5,
                                    }}>
                                        {category.image ? (
                                            <Image source={{ uri: category.image }} style={{ width: 52, height: 52 }} resizeMode="contain" />
                                        ) : (
                                            <Icon name="category" size={34} color={Colors.primary} library="material" />
                                        )}
                                    </View>
                                    <Text
                                        style={{ fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 }}
                                        numberOfLines={2}
                                    >
                                        {category.name || 'Unknown'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Popular Products - Horizontal Scroll */}
                {products.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
                            <Text style={{ fontSize: 19, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 }}>Popular Products</Text>
                            <TouchableOpacity onPress={() => router.push('/products/search')}>
                                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                            {products.slice(0, 6).map((product) => (
                                <View key={product.id} style={{ width: 160 }}>
                                    <ProductCard product={product} onPress={() => handleProductPress(product)} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* All Products Grid */}
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
                        <Text style={{ fontSize: 19, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 }}>All Products</Text>
                    </View>

                    {error ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Icon name="error-outline" size={32} color={Colors.error} library="material" />
                            <Text style={{ color: Colors.error, textAlign: 'center', marginTop: 10, fontSize: 14 }}>{error}</Text>
                        </View>
                    ) : (
                        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {products.map((product) => (
                                <View key={product.id} style={{ width: (width - 44) / 2 }}>
                                    <ProductCard product={product} onPress={() => handleProductPress(product)} />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
