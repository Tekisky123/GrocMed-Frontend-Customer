import { Category, categoryApi } from '@/api/categoryApi';
import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon, Icons } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useCart } from '@/contexts/CartContext';
import { mapApiProductsToUiProducts } from '@/utils/productHelper';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Product } from '@/types';
import { router } from 'expo-router';
import { bannerApi, Banner } from '@/api/bannerApi';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Animated, Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View, FlatList, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi } from '@/api/customerApi';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StoreStatusBanner } from '@/components/StoreStatusBanner';


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
const BANNER_ASPECT_RATIO = 2 / 1; // Standard modern mobile banner ratio
const BANNER_WIDTH = width;
const BANNER_HEIGHT = BANNER_WIDTH / BANNER_ASPECT_RATIO;

// Memoized Banner component to encapsulate currentBanner state and auto-play interval
const HomeBanners = React.memo(({ banners, loading, refreshing, router }: { banners: Banner[], loading: boolean, refreshing: boolean, router: any }) => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-slide banner
    useEffect(() => {
        if (!isAutoPlay || loading || refreshing) return;
        
        const bannerCount = banners.length > 0 ? banners.length : HOME_BANNERS.length;
        const interval = setInterval(() => {
            setCurrentBanner((prev) => {
                const next = (prev + 1) % bannerCount;
                scrollViewRef.current?.scrollTo({ x: next * width, animated: true });
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoPlay, banners, loading, refreshing]);

    if (loading && !refreshing) {
        return <SkeletonLoader height={BANNER_HEIGHT} width={BANNER_WIDTH} />;
    }

    const items = banners.length > 0 ? banners : HOME_BANNERS;

    return (
        <View className="mb-6 relative">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => setIsAutoPlay(false)}
                onMomentumScrollEnd={(event) => {
                    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
                    setCurrentBanner(slideIndex);
                    setIsAutoPlay(true);
                }}
                snapToInterval={BANNER_WIDTH}
                decelerationRate="fast"
            >
                {items.map((banner: any) => (
                    <View 
                        key={banner._id || banner.id} 
                        style={{ 
                            width: BANNER_WIDTH,
                            paddingHorizontal: 16,
                        }}
                    >
                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={() => banner.link && router.push(banner.link as any)}
                            style={{
                                height: BANNER_HEIGHT, 
                                backgroundColor: banner.color || Colors.primary, 
                                overflow: 'hidden',
                                borderRadius: 5,
                            }}
                        >
                            {/* Background Image */}
                            {banner.image ? (
                                <Image 
                                    source={{ uri: banner.image }} 
                                    style={{ width: '100%', height: '100%' }} 
                                    resizeMode="cover" 
                                />
                            ) : (
                                <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
                                    <View style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                    <View>
                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: 'white', textTransform: 'uppercase' }}>{banner.tag || 'PROMO'}</Text>
                                        </View>
                                        <Text style={{ fontSize: 32, fontWeight: '900', color: 'white', lineHeight: 36 }}>{banner.title || ''}</Text>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{banner.subtitle || ''}</Text>
                                    </View>
                                </View>
                            )}
                            
                            {/* Standard Text Overlay for Dynamic Banners */}
                            {banners.length > 0 && banner.title && (
                                <View 
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        left: 0, 
                                        right: 0, 
                                        padding: 20,
                                        backgroundColor: 'rgba(0,0,0,0.35)',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>{banner.title || ''}</Text>
                                    {banner.description && (
                                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 }} numberOfLines={1}>
                                            {banner.description || ''}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
});

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Infinite scroll pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
 
    const { getItemCount, refreshCart, refreshSettings, settings } = useCart();
    const { setCartIconPosition } = useCartAnimation();
    const { isAuthenticated, user } = useAuth();


    const loadUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }
        try {
            const res = await customerApi.getNotifications();
            if (res.success && res.notifications) {
                const lastViewedTimeStr = await AsyncStorage.getItem(`@notification_last_viewed_time_${user?.id || 'guest'}`);
                const lastViewedTime = lastViewedTimeStr ? new Date(lastViewedTimeStr).getTime() : 0;
                
                const count = res.notifications.filter((n: any) => {
                    const sentTime = new Date(n.sentAt || n.createdAt).getTime();
                    return sentTime > lastViewedTime;
                }).length;
                
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Error loading unread notification count:', error);
        }
    }, [isAuthenticated, user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadUnreadCount();
            refreshCart();
            refreshSettings();
        }, [loadUnreadCount, refreshCart, refreshSettings])
    );

    const loadData = useCallback(async () => {
        try {
            setPage(1);
            const [productsRes, categoriesRes, bannersRes] = await Promise.all([
                productApi.getAllProducts(1, 20).catch(() => ({ success: false, data: [] as ApiProduct[], totalPages: 1 })),
                categoryApi.getAllCategories().catch(() => ({ success: false, data: [] as Category[] })),
                bannerApi.getBanners().catch(() => ({ success: false, data: [] as Banner[] })),
            ]);

            if (productsRes.success && Array.isArray(productsRes.data)) {
                setProducts(mapApiProductsToUiProducts(productsRes.data));
                setTotalPages(productsRes.totalPages || 1);
            } else if (products.length === 0) {
                setError('Unable to load products');
            }

            if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
                setCategories(categoriesRes.data.filter(c => c && c.name));
            }

            if (bannersRes.success && Array.isArray(bannersRes.data) && bannersRes.data.length > 0) {
                setBanners(bannersRes.data);
            } else {
                setBanners([]); // Will fallback to HOME_BANNERS in render
            }
        } catch (err) {
            console.error('Error loading home data:', err);
            if (products.length === 0) setError('Connection error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadMoreProducts = async () => {
        if (isLoadingMore || page >= totalPages) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await productApi.getAllProducts(nextPage, 20);
            if (res.success && Array.isArray(res.data)) {
                const newProducts = mapApiProductsToUiProducts(res.data);
                setProducts((prev) => [...prev, ...newProducts]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error('Error loading more products:', err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
        refreshSettings();
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

    const renderHeader = useMemo(() => {
        return (
            <View className="pb-3">
                {/* Banner Section */}
                <HomeBanners 
                    banners={banners} 
                    loading={loading} 
                    refreshing={refreshing} 
                    router={router} 
                />

                {/* Categories Section - Displaying All Categories */}
                <View className="mb-6">
                    <SectionHeader 
                        title="Shop by Category" 
                        actionText="See All" 
                        onActionPress={() => router.push('/categories')} 
                    />

                    {loading && !refreshing ? (
                        <View className="flex-row px-4 gap-1.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <View key={i} className="items-center">
                                    <SkeletonLoader width={58} height={58} borderRadius={5} />
                                    <SkeletonLoader width={50} height={10} style={{ marginTop: 6 }} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap px-4 justify-start gap-1.5 gap-y-3">
                            {categories.filter(c => c).map((item, index) => {
                                const tileWidth = Math.floor((width - 32 - 24) / 5);
                                return (
                                    <CategoryTile
                                        key={item.name || index.toString()}
                                        name={item.name}
                                        image={typeof item.image === 'string' ? item.image : (item.image as any)?.url}
                                        icon={(item as any).icon}
                                        size={tileWidth}
                                        onPress={() => handleCategoryPress(item)}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Recent/Popular Products Section */}
                {products.slice(0, 8).length > 0 && (
                    <View className="mb-6">
                        <SectionHeader 
                            title="Top Picks for You" 
                            actionText="View All" 
                            onActionPress={() => router.push('/products/search')} 
                        />
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
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
                <View className="px-4 mb-3">
                    <Text className="text-lg font-black text-slate-900 tracking-tight">All Products</Text>
                </View>
            </View>
        );
    }, [banners, loading, refreshing, categories, products]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="bg-white px-4 py-2 border-b border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Image
                        source={require('@/assets/images/logo-removebg-preview.png')}
                        style={{ width: 36, height: 36 }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 }}>
                        Groc<Text style={{ color: Colors.primary }}>Med</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    onLayout={(e) => {
                        const { x, y, width: w, height: h } = e.nativeEvent.layout;
                        setCartIconPosition({ x, y, width: w, height: h });
                    }}
                    onPress={() => router.push('/(tabs)/cart')}
                    className="relative p-2"
                    activeOpacity={0.8}
                >
                    <Icon name="shopping-cart" size={24} color={Colors.textPrimary} library="material" />
                    {getItemCount() > 0 && (
                        <View className="absolute top-0 right-0 bg-red-500 rounded-[5px] min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white">
                            <Text className="text-white text-[9px] font-extrabold">
                                {getItemCount() > 99 ? '99+' : getItemCount()}
                            </Text>
                        </View>
                    )}
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
                    <View className="px-5">
                        <View className="flex-row gap-3 mb-3">
                            <SkeletonLoader height={240} width={(width - 52) / 2} borderRadius={5} />
                            <SkeletonLoader height={240} width={(width - 52) / 2} borderRadius={5} />
                        </View>
                        <View className="flex-row gap-3">
                            <SkeletonLoader height={240} width={(width - 52) / 2} borderRadius={5} />
                            <SkeletonLoader height={240} width={(width - 52) / 2} borderRadius={5} />
                        </View>
                    </View>
                ) : error ? (
                    <View className="p-10 items-center">
                        <Icon name="error-outline" size={48} color={Colors.error} library="material" />
                        <Text className="text-gray-500 text-center mt-4 text-base">{error}</Text>
                        <TouchableOpacity onPress={onRefresh} className="mt-6 px-6 py-3 bg-orange-500 rounded-[5px]">
                            <Text className="text-white font-bold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <View className="flex-1">
                        <ProductCard product={item} onPress={() => handleProductPress(item)} />
                    </View>
                )}
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.3}
                ListFooterComponent={() => (
                    isLoadingMore ? (
                        <View className="py-6 items-center">
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    ) : null
                )}
            />
        </SafeAreaView>
    );
}
