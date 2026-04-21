import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { mapApiProductToUiProduct, mapApiProductsToUiProducts } from '@/utils/productHelper';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HOME_BANNERS = [
    {
        id: 1,
        title: 'Wholesale For All',
        subtitle: 'Groceries & Medicines',
        color: '#4361EE',
        tag: 'GrocMed Choice',
        description: 'Get deep discounts on premium groceries and essential medical supplies direct to your door.'
    },
    {
        id: 2,
        title: 'Bulk Buy & Save',
        subtitle: 'Cartons & Multi-packs',
        color: '#7209B7',
        tag: 'Volume Deal',
        description: 'Unlock massive savings with our unique multi-packaging buying options. Perfect for shops and families.'
    },
    {
        id: 3,
        title: 'Trusted Quality',
        subtitle: 'Verified & Authentic',
        color: '#EE6C4D',
        tag: 'Premium Only',
        description: 'Every product is 100% genuine and quality checked for your peace of mind.'
    },
];

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    const { getItemCount } = useCart();
    const { setCartIconPosition } = useCartAnimation();
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-slide banner
    useEffect(() => {
        if (!isAutoPlay) return;
        
        const interval = setInterval(() => {
            setCurrentBanner((prev) => {
                const next = (prev + 1) % HOME_BANNERS.length;
                scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoPlay]);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productApi.getAllProducts().catch(() => ({ success: false, data: [] as ApiProduct[] })),
                categoryApi.getAllCategories().catch(() => ({ success: false, data: [] as Category[] })),
            ]);

            if (productsRes.success && Array.isArray(productsRes.data)) {
                setProducts(mapApiProductsToUiProducts(productsRes.data));
            } else if (products.length === 0) {
                setError('Unable to load products');
            }

            if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
                setCategories(categoriesRes.data.filter(c => c && c.name));
            }
        } catch (err) {
            console.error('Error loading home data:', err);
            if (products.length === 0) setError('Connection error');
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
        if (!product?.id) return;
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
            <View style={{
                backgroundColor: Colors.background,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Image
                        source={require('@/assets/images/logo-removebg-preview.png')}
                        style={{ width: 190, height: 70 }}
                        resizeMode="contain"
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/notifications')}
                            style={{
                                marginRight: 12,
                                padding: 10,
                                backgroundColor: Colors.surface,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: Colors.border,
                            }}
                        >
                            <Icon name="notifications-none" size={24} color={Colors.textPrimary} library="material" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onLayout={(e) => {
                                const { x, y, width: w, height: h } = e.nativeEvent.layout;
                                setCartIconPosition({ x, y, width: w, height: h });
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
                </View>

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

            <FlatList
                data={loading || error ? [] : products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                columnWrapperStyle={{ paddingHorizontal: 20, gap: 12, marginBottom: 12 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                ListEmptyComponent={loading && !refreshing ? () => (
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                        </View>
                    </View>
                ) : error ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Icon name="error-outline" size={48} color={Colors.error} library="material" />
                        <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 16, fontSize: 16 }}>{error}</Text>
                        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 }}>
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                ListHeaderComponent={() => (
                    <View style={{ paddingBottom: 12 }}>
                        {/* Banner Section */}
                        <View style={{ marginTop: 16, marginBottom: 24 }}>
                            {loading && !refreshing ? (
                                <View style={{ paddingHorizontal: 20 }}>
                                    <SkeletonLoader height={210} borderRadius={20} />
                                </View>
                            ) : (
                                <>
                                    <ScrollView
                                        ref={scrollViewRef}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScrollBeginDrag={() => setIsAutoPlay(false)}
                                        onMomentumScrollEnd={(event) => {
                                            const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                                            setCurrentBanner(slideIndex);
                                            setIsAutoPlay(true);
                                        }}
                                        snapToInterval={width}
                                        decelerationRate="fast"
                                    >
                                        {HOME_BANNERS.map((banner) => (
                                            <View key={banner.id} style={{ width: width, paddingHorizontal: 20 }}>
                                                <View style={{
                                                    height: 210, backgroundColor: banner.color, borderRadius: 20, padding: 24,
                                                    justifyContent: 'space-between', shadowColor: banner.color, shadowOffset: { width: 0, height: 8 },
                                                    shadowOpacity: 0.4, shadowRadius: 12, overflow: 'hidden',
                                                }}>
                                                    <View style={{ position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.15)' }} />
                                                    <View style={{ position: 'absolute', right: 20, bottom: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                                    <View>
                                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 }}>
                                                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.8 }}>{banner.tag}</Text>
                                                        </View>
                                                        <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 8, lineHeight: 36 }}>{banner.title}</Text>
                                                        <Text style={{ fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.95)', marginBottom: 8 }}>{banner.subtitle}</Text>
                                                        <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', lineHeight: 18 }}>{banner.description}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                                        {HOME_BANNERS.map((_, index) => (
                                            <View key={index} style={{ width: index === currentBanner ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: index === currentBanner ? Colors.primary : Colors.gray300 }} />
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Categories Section */}
                        <View style={{ marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>Shop by Category</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                                    <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 14 }}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            {loading && !refreshing ? (
                                <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 14 }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <View key={i} style={{ alignItems: 'center' }}>
                                            <SkeletonLoader width={75} height={75} borderRadius={38} />
                                            <SkeletonLoader width={60} height={12} style={{ marginTop: 8 }} />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
                                    data={categories.filter(c => c)}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={{ alignItems: 'center', width: 75 }} onPress={() => handleCategoryPress(item)} activeOpacity={0.7}>
                                            <View style={{ width: 75, height: 75, borderRadius: 38, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}>
                                                {item.image ? <Image source={{ uri: item.image }} style={{ width: 52, height: 52 }} resizeMode="contain" /> : <Icon name="category" size={34} color={Colors.primary} library="material" />}
                                            </View>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', lineHeight: 16 }} numberOfLines={2}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>

                        {/* Recent/Popular Products Section */}
                        {products.length > 0 && (
                            <View style={{ marginBottom: 32 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>Top Picks for You</Text>
                                    <TouchableOpacity onPress={() => router.push('/products/search')}>
                                        <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 14 }}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                                    data={products.slice(0, 8)}
                                    keyExtractor={(item) => `popular_${item.id}`}
                                    renderItem={({ item }) => (
                                        <View style={{ width: width * 0.44 }}>
                                            <ProductCard product={item} onPress={() => handleProductPress(item)} />
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {/* All Products Header */}
                        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 }}>All Products</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, paddingHorizontal: 10, marginBottom: 8 }}>
                        <ProductCard product={item} onPress={() => handleProductPress(item)} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
