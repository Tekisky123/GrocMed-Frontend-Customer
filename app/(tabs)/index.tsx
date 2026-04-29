import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { mapApiProductsToUiProducts } from '@/utils/productHelper';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Product } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

    const loadData = useCallback(async () => {
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
    }, [products.length]);

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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="bg-white px-5 py-3 border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-3">
                    <Image
                        source={require('@/assets/images/logo-removebg-preview.png')}
                        style={{ width: 130, height: 45 }}
                        resizeMode="contain"
                    />

                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/notifications')}
                            className="mr-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200 relative"
                        >
                            <Icon name="notifications-none" size={24} color={Colors.textPrimary} library="material" />
                            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white">
                                <Text className="text-white text-[9px] font-extrabold">3</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onLayout={(e) => {
                                const { x, y, width: w, height: h } = e.nativeEvent.layout;
                                setCartIconPosition({ x, y, width: w, height: h });
                            }}
                            onPress={() => router.push('/(tabs)/cart')}
                            className="relative p-2.5 bg-gray-50 rounded-xl border border-gray-200"
                        >
                            <Icon name="shopping-cart" size={24} color={Colors.textPrimary} library="material" />
                            {getItemCount() > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-[20px] items-center justify-center px-1 border-2 border-white">
                                    <Text className="text-white text-[10px] font-extrabold">
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
                    className="flex-row items-center bg-gray-50 rounded-xl px-4 h-12 border border-gray-200 shadow-sm"
                >
                    <Icon name={Icons.search.name} size={20} color={Colors.textTertiary} library={Icons.search.library} />
                    <Text className="ml-3 text-gray-400 text-[15px] font-medium flex-1">
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
                    <View className="gap-3 px-5">
                        <View className="flex-row gap-3">
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                        </View>
                        <View className="flex-row gap-3">
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                            <SkeletonLoader height={220} width={(width - 52) / 2} borderRadius={16} />
                        </View>
                    </View>
                ) : error ? (
                    <View className="p-10 items-center">
                        <Icon name="error-outline" size={48} color={Colors.error} library="material" />
                        <Text className="text-gray-500 text-center mt-4 text-base">{error}</Text>
                        <TouchableOpacity onPress={onRefresh} className="mt-6 px-6 py-3 bg-orange-500 rounded-xl">
                            <Text className="text-white font-bold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                ListHeaderComponent={() => (
                    <View className="pb-3">
                        {/* Banner Section */}
                        <View className="mt-4 mb-6">
                            {loading && !refreshing ? (
                                <View className="px-5">
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
                                                    <View className="absolute -right-14 -top-14 w-56 h-56 rounded-full bg-white/10" />
                                                    <View className="absolute right-5 -bottom-10 w-36 h-36 rounded-full bg-white/10" />
                                                    <View>
                                                        <View className="bg-white/30 px-3 py-1.5 rounded-lg self-start mb-3">
                                                            <Text className="text-[11px] font-extrabold text-white uppercase tracking-wider">{banner.tag}</Text>
                                                        </View>
                                                        <Text className="text-3xl font-extrabold text-white mb-2 leading-tight">{banner.title}</Text>
                                                        <Text className="text-lg font-semibold text-white/95 mb-2">{banner.subtitle}</Text>
                                                        <Text className="text-[13px] font-medium text-white/80 leading-snug">{banner.description}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                    <View className="flex-row justify-center mt-4 gap-2">
                                        {HOME_BANNERS.map((_, index) => (
                                            <View key={index} className={`h-2 rounded-full ${index === currentBanner ? 'w-7 bg-orange-500' : 'w-2 bg-gray-300'}`} />
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Categories Section */}
                        <View className="mb-6">
                            <View className="flex-row justify-between items-center px-5 mb-4">
                                <Text className="text-xl font-extrabold text-gray-900 tracking-tight">Shop by Category</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                                    <Text className="text-orange-500 font-bold text-sm">See All</Text>
                                </TouchableOpacity>
                            </View>

                            {loading && !refreshing ? (
                                <View className="flex-row px-5 gap-3.5">
                                    {[1, 2, 3, 4].map((i) => (
                                        <View key={i} className="items-center">
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
                                        <TouchableOpacity className="items-center w-[75px]" onPress={() => handleCategoryPress(item)} activeOpacity={0.7}>
                                            <View className="w-[75px] h-[75px] rounded-full bg-white justify-center items-center mb-2.5 border border-gray-100 shadow-sm">
                                                {item.image ? <Image source={{ uri: item.image }} className="w-[52px] h-[52px]" resizeMode="contain" /> : <Icon name="category" size={34} color={Colors.primary} library="material" />}
                                            </View>
                                            <Text className="text-xs font-bold text-gray-900 text-center leading-tight" numberOfLines={2}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>

                        {/* Recent/Popular Products Section */}
                        {products.length > 0 && (
                            <View className="mb-8">
                                <View className="flex-row justify-between items-center px-5 mb-4">
                                    <Text className="text-xl font-extrabold text-gray-900 tracking-tight">Top Picks for You</Text>
                                    <TouchableOpacity onPress={() => router.push('/products/search')}>
                                        <Text className="text-orange-500 font-bold text-sm">View All</Text>
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
                        <View className="px-5 mb-4">
                            <Text className="text-xl font-extrabold text-gray-900 tracking-tight">All Products</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View className="flex-1">
                        <ProductCard product={item} onPress={() => handleProductPress(item)} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
