import { Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Product } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Helper to map API product to UI product
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
        images: apiProduct.images,
        categoryId: apiProduct.category,
        brandId: apiProduct.brand,
        brand: apiProduct.brand, // Assuming brand name or object is passed
        category: apiProduct.category,
        inStock: apiProduct.stock > 0 && apiProduct.isActive,
        stockQuantity: apiProduct.stock,
        unit: apiProduct.unitType,
        minQuantity: apiProduct.minimumQuantity || 1,
        maxQuantity: 10,
        rating: 4.5, // Placeholder if not in API
        reviewCount: 127, // Placeholder if not in API
        ingredients: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        manfDate: apiProduct.manfDate,
        expiryDate: apiProduct.expiryDate,
    };
};

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addToCart, getItemQuantity } = useCart();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            const cartQty = getItemQuantity(product.id);
            setQuantity(cartQty > 0 ? cartQty : product.minQuantity);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [product]);

    const loadProduct = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const response = await productApi.getProductById(id);
            if (response.success && response.data) {
                const mappedProduct = mapApiProductToUiProduct(response.data);
                setProduct(mappedProduct);

                const suggestedResponse = await productApi.getSuggestedProducts(id);
                if (suggestedResponse.success && Array.isArray(suggestedResponse.data)) {
                    const suggested = suggestedResponse.data
                        .map(mapApiProductToUiProduct);
                    setSuggestedProducts(suggested);
                }
            } else {
                setError('Product not found');
            }
        } catch (err) {
            console.error('Error loading product:', err);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!product) return;

        if (newQuantity < product.minQuantity) {
            showToast(`Minimum quantity is ${product.minQuantity}`, 'info');
            return;
        }

        if (newQuantity > product.stockQuantity) {
            showToast(`Only ${product.stockQuantity} items available`, 'info');
            return;
        }

        setQuantity(newQuantity);
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            await addToCart(product, quantity);
            showToast(`Added ${quantity} ${product.unit} to cart`, 'success');
        } catch (error) {
            showToast('Failed to add to cart', 'error');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
                <View style={{ padding: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: Colors.textPrimary }}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: Colors.textSecondary }}>{error || 'Product not found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const displayImages = product.images && product.images.length > 0 ? product.images : [product.image];
    const hasDiscount = product.discount && product.discount > 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14, // Increased slightly for better touch area
                backgroundColor: Colors.background,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
                <Text style={{ flex: 1, marginLeft: 12, fontSize: 18, fontWeight: '700', color: Colors.textPrimary }} numberOfLines={1}>
                    {product.name}
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Product Image Section - Consistent with ProductCard styles */}
                    <View style={{ backgroundColor: '#F8F9FA', paddingVertical: 20, alignItems: 'center' }}>
                        {hasDiscount && (
                            <View style={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                backgroundColor: Colors.error,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                zIndex: 1,
                            }}>
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{product.discount}% OFF</Text>
                            </View>
                        )}

                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                                setActiveImageIndex(index);
                            }}
                            contentContainerStyle={{ alignItems: 'center' }}
                        >
                            {displayImages.map((imageUri, index) => (
                                <View key={index} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: width - 32, height: 300 }}
                                        resizeMode="contain"
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        {/* Pagination Dots */}
                        {displayImages.length > 1 && (
                            <View style={{ flexDirection: 'row', marginTop: 16, gap: 6 }}>
                                {displayImages.map((_, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            width: index === activeImageIndex ? 24 : 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: index === activeImageIndex ? Colors.primary : Colors.gray300,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Details Container */}
                    <View style={{ padding: 16 }}>
                        {/* Title & Unit */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, marginBottom: 4 }}>
                                {product.name}
                            </Text>
                            <Text style={{ fontSize: 14, color: Colors.textTertiary, fontWeight: '500' }}>
                                {product.unit}
                            </Text>
                        </View>

                        {/* Rating & Reviews */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFF8E1',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                marginRight: 8
                            }}>
                                <Icon name="star" size={16} color="#FFA500" library="material" />
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#F57C00', marginLeft: 4 }}>
                                    {product.rating}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, color: Colors.textTertiary, fontWeight: '500' }}>
                                {product.reviewCount} Ratings & Reviews
                            </Text>
                        </View>

                        {/* Price & Stock Block - Enhanced Professional Look */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: Colors.surface,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.05)',
                            marginBottom: 24,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8
                        }}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginRight: 8 }}>
                                        ₹{product.price}
                                    </Text>
                                    {hasDiscount && (
                                        <Text style={{ fontSize: 14, color: Colors.textTertiary, textDecorationLine: 'line-through' }}>
                                            ₹{product.originalPrice}
                                        </Text>
                                    )}
                                </View>
                                {hasDiscount && (
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.success, marginTop: 4 }}>
                                        You save ₹{(product.originalPrice || 0) - product.price}
                                    </Text>
                                )}
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                {product.inStock ? (
                                    <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                        <Text style={{ color: Colors.success, fontSize: 12, fontWeight: '700' }}>IN STOCK</Text>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                        <Text style={{ color: Colors.error, fontSize: 12, fontWeight: '700' }}>OUT OF STOCK</Text>
                                    </View>
                                )}
                                <Text style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 4 }}>Inclusive of all taxes</Text>
                            </View>
                        </View>

                        {/* Quantity Selector - Large Touch Targets */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>
                                Quantity
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: 12,
                                    padding: 4
                                }}>
                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= product.minQuantity}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: '#fff',
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            opacity: quantity <= product.minQuantity ? 0.5 : 1
                                        }}
                                    >
                                        <Icon name="remove" size={20} color={Colors.textPrimary} library="material" />
                                    </TouchableOpacity>

                                    <View style={{ width: 60, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>{quantity}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= product.stockQuantity}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: Colors.primary,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: quantity >= product.stockQuantity ? 0.5 : 1
                                        }}
                                    >
                                        <Icon name="add" size={20} color="#fff" library="material" />
                                    </TouchableOpacity>
                                </View>

                                {/* Total Calculation */}
                                <View>
                                    <Text style={{ fontSize: 12, color: Colors.textTertiary, textAlign: 'right' }}>Total</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>₹{product.price * quantity}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Product Highlights / Specs */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 }}>
                                Product Details
                            </Text>
                            <View style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden' }}>
                                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, padding: 12 }}>
                                    <Text style={{ flex: 1, color: Colors.textTertiary, fontSize: 13 }}>Unit</Text>
                                    <Text style={{ flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' }}>{product.unit}</Text>
                                </View>
                                {/* Display Brand if is a string, checking since API might return ID */}
                                {/* Only display if brand is defined and is a string for now, or use a safe method */}
                                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, padding: 12 }}>
                                    <Text style={{ flex: 1, color: Colors.textTertiary, fontSize: 13 }}>Availability</Text>
                                    <Text style={{ flex: 1, color: Colors.success, fontSize: 13, fontWeight: '600' }}>In Stock</Text>
                                </View>
                                <View style={{ flexDirection: 'row', padding: 12 }}>
                                    <Text style={{ flex: 1, color: Colors.textTertiary, fontSize: 13 }}>Country of Origin</Text>
                                    <Text style={{ flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' }}>India</Text>
                                </View>
                            </View>
                        </View>

                        {/* Description */}
                        {product.description && (
                            <View style={{ marginBottom: 32 }}>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 }}>
                                    Description
                                </Text>
                                <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 22 }}>
                                    {product.description}
                                </Text>
                            </View>
                        )}

                        {/* Action Button */}
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            disabled={!product.inStock}
                            style={{
                                backgroundColor: product.inStock ? Colors.primary : Colors.gray300,
                                paddingVertical: 18,
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: product.inStock ? Colors.primary : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: product.inStock ? 0.25 : 0,
                                shadowRadius: 8,
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '800',
                                color: '#fff',
                                letterSpacing: 0.5
                            }}>
                                {product.inStock ? 'ADD TO CART' : 'NOTIFY ME'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* Related Products Divider */}
                    <View style={{ height: 12, backgroundColor: '#F3F4F6', marginBottom: 24 }} />

                    {/* Related Products */}
                    {suggestedProducts.length > 0 && (
                        <View style={{ paddingBottom: 24 }}>
                            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>
                                    You Might Also Like
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                            >
                                {suggestedProducts.map((item) => (
                                    <View key={item.id} style={{ width: 154 }}>
                                        <ProductCard
                                            product={item}
                                            onPress={() => router.push(`/products/${item.id}`)}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
