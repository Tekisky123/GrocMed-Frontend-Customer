import { PackagingOption, Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { mapApiProductToUiProduct, mapApiProductsToUiProducts } from '@/utils/productHelper';
import { formatSafeDate } from '@/utils/dateHelper';
import { Product } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addToCart, getItemQuantity } = useCart();
    const { showToast } = useToast();

    const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<PackagingOption | null>(null);
    const [quantity, setQuantity] = useState(1);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const quantityInitialized = useRef(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    useEffect(() => {
        if (product && !quantityInitialized.current) {
            quantityInitialized.current = true;
            const cartQty = getItemQuantity(product.id);
            setQuantity(cartQty > 0 ? cartQty : (selectedOption?.minQty || product.minQuantity || 1));
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }
    }, [product?.id]);

    const loadProduct = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getProductById(id);
            if (response.success && response.data) {
                setApiProduct(response.data);
                setProduct(mapApiProductToUiProduct(response.data));

                // Default to first packaging option if available
                if (response.data.packagingOptions?.length) {
                    setSelectedOption(response.data.packagingOptions[0]);
                    setQuantity(response.data.packagingOptions[0].minQty || 1);
                }

                const suggestedResponse = await productApi.getSuggestedProducts(id);
                if (suggestedResponse.success && Array.isArray(suggestedResponse.data)) {
                    setSuggestedProducts(suggestedResponse.data.map(mapApiProductToUiProduct));
                }
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    // Derived values from selected option or product fallback
    const activePrice = selectedOption?.salePrice ?? product?.price ?? 0;
    const activeMrp = selectedOption?.mrp ?? product?.price ?? 0;
    const activeStock = selectedOption?.stock ?? product?.stockQuantity ?? 0;
    const activeMinQty = selectedOption?.minQty ?? product?.minQuantity ?? 1;
    const hasOptionDiscount = selectedOption ? selectedOption.salePrice < selectedOption.mrp : false;
    const optionDiscount = hasOptionDiscount
        ? Math.round(((selectedOption!.mrp - selectedOption!.salePrice) / selectedOption!.mrp) * 100)
        : 0;
    const isInStock = activeStock > 0 && (apiProduct?.isActive ?? true);

    const handleOptionSelect = (option: PackagingOption) => {
        setSelectedOption(option);
        setQuantity(option.minQty || 1);
    };

    const handleQuantityChange = (newQty: number) => {
        if (newQty < activeMinQty) {
            showToast(`Minimum order is ${activeMinQty} pack${activeMinQty > 1 ? 's' : ''}`, 'info');
            return;
        }
        if (newQty > activeStock) {
            showToast(`Only ${activeStock} available`, 'info');
            return;
        }
        setQuantity(newQty);
    };

    const handleAddToCart = () => {
        if (!product || !isInStock) return;
        if (selectedOption) {
            // Build a product-like object with the option's price for the cart context
            const optionProduct: Product = {
                ...product,
                id: product.id,
                price: selectedOption.salePrice,
                originalPrice: selectedOption.mrp > selectedOption.salePrice ? selectedOption.mrp : undefined,
                minQuantity: selectedOption.minQty,
                stockQuantity: selectedOption.stock,
            };
            addToCart(optionProduct, quantity, selectedOption._id);
        } else {
            addToCart(product, quantity);
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

    const displayImages: string[] = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean) as string[];
    if (displayImages.length === 0) displayImages.push('https://via.placeholder.com/400?text=Product+Image');
    const hasPackagingOptions = (apiProduct?.packagingOptions?.length ?? 0) > 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Image Section */}
                    <View style={styles.imageContainer}>
                        {(optionDiscount > 0 || (product.discount ?? 0) > 0) && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>
                                    {optionDiscount > 0 ? optionDiscount : product.discount}% OFF
                                </Text>
                            </View>
                        )}
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) =>
                                setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
                            }
                            snapToInterval={width}
                            decelerationRate="fast"
                        >
                            {displayImages.map((uri, index) => (
                                <View key={index} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={{ uri }} style={{ width: width - 32, height: 300 }} resizeMode="contain" />
                                </View>
                            ))}
                        </ScrollView>
                        {displayImages.length > 1 && (
                            <View style={{ flexDirection: 'row', marginTop: 16, gap: 6 }}>
                                {displayImages.map((_, i) => (
                                    <View key={i} style={{
                                        width: i === activeImageIndex ? 24 : 6, height: 6,
                                        borderRadius: 3,
                                        backgroundColor: i === activeImageIndex ? Colors.primary : Colors.gray300,
                                    }} />
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.contentPadding}>

                        {/* Title */}
                        <Text style={styles.productName}>{product.name}</Text>
                        {product.unit ? (
                            <Text style={styles.productUnit}>{product.unit}</Text>
                        ) : null}

                        {/* ── Buying Options ────────────────────────────────────── */}
                        {hasPackagingOptions && (
                            <View style={styles.sectionBlock}>
                                <Text style={styles.sectionLabel}>Choose How to Buy</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 10, paddingRight: 4 }}
                                >
                                    {apiProduct!.packagingOptions!.map((opt) => {
                                        const isSelected = selectedOption?._id === opt._id;
                                        const outOfStock = opt.stock <= 0;
                                        const optDiscount = opt.salePrice < opt.mrp
                                            ? Math.round(((opt.mrp - opt.salePrice) / opt.mrp) * 100)
                                            : 0;

                                        return (
                                            <TouchableOpacity
                                                key={opt._id}
                                                onPress={() => !outOfStock && handleOptionSelect(opt)}
                                                activeOpacity={0.8}
                                                style={[
                                                    styles.optionCard,
                                                    isSelected && styles.optionCardSelected,
                                                    outOfStock && styles.optionCardDisabled,
                                                ]}
                                            >
                                                {/* Selected checkmark */}
                                                {isSelected && (
                                                    <View style={styles.optionCheck}>
                                                        <Icon name="check" size={10} color="#fff" library="material" />
                                                    </View>
                                                )}

                                                {/* Discount badge */}
                                                {optDiscount > 0 && (
                                                    <View style={styles.optionDiscountBadge}>
                                                        <Text style={styles.optionDiscountText}>{optDiscount}% off</Text>
                                                    </View>
                                                )}

                                                {/* Label */}
                                                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]} numberOfLines={2}>
                                                    {opt.label}
                                                </Text>

                                                {/* Units */}
                                                <Text style={styles.optionUnits}>
                                                    {opt.unitsPerPack} unit{opt.unitsPerPack !== 1 ? 's' : ''} / pack
                                                </Text>

                                                {/* Prices */}
                                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                                                    <Text style={[styles.optionSalePrice, isSelected && { color: Colors.primary }]}>
                                                        ₹{opt.salePrice}
                                                    </Text>
                                                    {opt.mrp > opt.salePrice && (
                                                        <Text style={styles.optionMrp}>₹{opt.mrp}</Text>
                                                    )}
                                                </View>

                                                {/* Min qty hint */}
                                                {opt.minQty > 1 && (
                                                    <Text style={styles.optionMinQty}>Min {opt.minQty} packs</Text>
                                                )}

                                                {/* Stock status */}
                                                <View style={[
                                                    styles.stockBadge,
                                                    { backgroundColor: outOfStock ? '#FFEBEE' : '#E8F5E9' },
                                                ]}>
                                                    <Text style={[
                                                        styles.stockBadgeText,
                                                        { color: outOfStock ? Colors.error : Colors.success },
                                                    ]}>
                                                        {outOfStock ? 'Out of stock' : `${opt.stock} left`}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        {/* ── Price & Stock Block ─────────────────────────────── */}
                        <View style={styles.priceBlock}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                    <Text style={styles.priceMain}>₹{activePrice}</Text>
                                    {hasOptionDiscount && (
                                        <Text style={styles.priceMrp}>₹{activeMrp}</Text>
                                    )}
                                </View>
                                {hasOptionDiscount && (
                                    <Text style={styles.priceSavings}>
                                        You save ₹{(activeMrp - activePrice).toFixed(2)} ({optionDiscount}% off)
                                    </Text>
                                )}
                                {selectedOption && (
                                    <Text style={styles.priceOptionHint}>
                                        {selectedOption.label} · {selectedOption.unitsPerPack} unit{selectedOption.unitsPerPack !== 1 ? 's' : ''} per pack
                                    </Text>
                                )}
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={[styles.stockIndicator, { backgroundColor: isInStock ? '#E8F5E9' : '#FFEBEE' }]}>
                                    <Text style={[styles.stockIndicatorText, { color: isInStock ? Colors.success : Colors.error }]}>
                                        {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                    </Text>
                                </View>
                                {isInStock && activeStock <= 10 && (
                                    <Text style={styles.lowStockHint}>Only {activeStock} left!</Text>
                                )}
                                <Text style={styles.taxHint}>
                                    Incl. all taxes {product.gstRate ? `(${product.gstRate}% GST)` : ''}
                                </Text>
                            </View>
                        </View>

                        {/* ── Quantity Selector ──────────────────────────────── */}
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionLabel}>
                                Quantity{selectedOption ? ` (packs)` : ''}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={styles.qtyRow}>
                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= activeMinQty}
                                        style={[styles.qtyBtn, { opacity: quantity <= activeMinQty ? 0.4 : 1 }]}
                                    >
                                        <Icon name="remove" size={20} color={Colors.textPrimary} library="material" />
                                    </TouchableOpacity>
                                    <View style={{ width: 56, alignItems: 'center' }}>
                                        <Text style={styles.qtyValue}>{quantity}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= activeStock}
                                        style={[styles.qtyBtnPrimary, { opacity: quantity >= activeStock ? 0.4 : 1 }]}
                                    >
                                        <Icon name="add" size={20} color="#fff" library="material" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 11, color: Colors.textTertiary }}>Total</Text>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary }}>
                                        ₹{(activePrice * quantity).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            {activeMinQty > 1 && (
                                <Text style={styles.minQtyNote}>
                                    ℹ️ Minimum order is {activeMinQty} pack{activeMinQty > 1 ? 's' : ''} for this option
                                </Text>
                            )}
                        </View>

                        {/* ── Product Details ────────────────────────────────── */}
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionLabel}>Product Details</Text>
                            <View style={styles.detailsTable}>
                                {product.unit ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>Unit Type</Text>
                                        <Text style={styles.detailVal}>{product.unit}</Text>
                                    </View>
                                ) : null}
                                {apiProduct?.brand ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>Brand</Text>
                                        <Text style={styles.detailVal}>{apiProduct.brand}</Text>
                                    </View>
                                ) : null}
                                {product.perUnitWeightVolume ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>Net Weight/Vol</Text>
                                        <Text style={styles.detailVal}>{product.perUnitWeightVolume}</Text>
                                    </View>
                                ) : null}
                                {product.gstRate ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>GST Rate</Text>
                                        <Text style={styles.detailVal}>{product.gstRate}%</Text>
                                    </View>
                                ) : null}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Availability</Text>
                                    <Text style={[styles.detailVal, { color: isInStock ? Colors.success : Colors.error }]}>
                                        {isInStock ? 'In Stock' : 'Out of Stock'}
                                    </Text>
                                </View>
                                {apiProduct?.manfDate ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailKey}>MFG Date</Text>
                                        <Text style={styles.detailVal}>
                                            {formatSafeDate(apiProduct.manfDate)}
                                        </Text>
                                    </View>
                                ) : null}
                                {apiProduct?.expiryDate ? (
                                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                        <Text style={styles.detailKey}>EXP Date</Text>
                                        <Text style={styles.detailVal}>
                                            {formatSafeDate(apiProduct.expiryDate)}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* ── Description ───────────────────────────────────── */}
                        {product.description ? (
                            <View style={styles.sectionBlock}>
                                <Text style={styles.sectionLabel}>Description</Text>
                                <Text style={styles.descText}>{product.description}</Text>
                            </View>
                        ) : null}

                        {/* ── Add to Cart Button ─────────────────────────────── */}
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            disabled={!isInStock}
                            activeOpacity={0.85}
                            style={[styles.addToCartBtn, { backgroundColor: isInStock ? Colors.primary : Colors.gray300 }]}
                        >
                            <Icon name="shopping-cart" size={20} color="#fff" library="material" />
                            <Text style={styles.addToCartText}>
                                {isInStock
                                    ? selectedOption
                                        ? `Add ${quantity} × ${selectedOption.label} — ₹${(activePrice * quantity).toFixed(2)}`
                                        : 'ADD TO CART'
                                    : 'OUT OF STOCK'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Related Products */}
                    {suggestedProducts.length > 0 && (
                        <>
                            <View style={{ height: 12, backgroundColor: '#F3F4F6', marginBottom: 24 }} />
                            <View style={{ paddingBottom: 24 }}>
                                <Text style={[styles.sectionLabel, { paddingHorizontal: 16, marginBottom: 16 }]}>
                                    You Might Also Like
                                </Text>
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
                        </>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        flex: 1,
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    imageContainer: {
        backgroundColor: '#F8F9FA',
        paddingVertical: 20,
        alignItems: 'center',
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
    discountBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    contentPadding: { padding: 16 },
    productName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, marginBottom: 4 },
    productUnit: { fontSize: 13, color: Colors.textTertiary, fontWeight: '500', marginBottom: 20 },

    // Section
    sectionBlock: { marginBottom: 24 },
    sectionLabel: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },

    // Option Cards
    optionCard: {
        width: 148,
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: '#fff',
        position: 'relative',
    },
    optionCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: '#F0F7FF',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    optionCardDisabled: { opacity: 0.45 },
    optionCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionDiscountBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    optionDiscountText: { fontSize: 10, fontWeight: '700', color: '#E65100' },
    optionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, lineHeight: 18, marginBottom: 2 },
    optionLabelSelected: { color: Colors.primary },
    optionUnits: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' },
    optionSalePrice: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    optionMrp: { fontSize: 12, color: Colors.textTertiary, textDecorationLine: 'line-through' },
    optionMinQty: { fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
    stockBadge: {
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    stockBadgeText: { fontSize: 10, fontWeight: '700' },

    // Price block
    priceBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    priceMain: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
    priceMrp: { fontSize: 14, color: Colors.textTertiary, textDecorationLine: 'line-through' },
    priceSavings: { fontSize: 12, fontWeight: '700', color: Colors.success, marginTop: 2 },
    priceOptionHint: { fontSize: 11, color: Colors.textTertiary, marginTop: 4 },
    stockIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    stockIndicatorText: { fontSize: 12, fontWeight: '700' },
    lowStockHint: { fontSize: 11, color: Colors.error, fontWeight: '600', marginTop: 4 },
    taxHint: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },

    // Qty
    qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 },
    qtyBtn: {
        width: 44, height: 44, backgroundColor: '#fff', borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
    },
    qtyBtnPrimary: {
        width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    qtyValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
    minQtyNote: { fontSize: 11, color: Colors.textTertiary, marginTop: 10, lineHeight: 16 },

    // Details table
    detailsTable: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden' },
    detailRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        padding: 12,
    },
    detailKey: { flex: 1, color: Colors.textTertiary, fontSize: 13 },
    detailVal: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },

    // Description
    descText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

    // Add to cart
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    addToCartText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
