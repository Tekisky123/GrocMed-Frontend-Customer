import { PackagingOption, Product as ApiProduct, productApi } from '@/api/productApi';
import { Icon } from '@/components/ui/Icon';
import { ProductCard } from '@/components/ui/ProductCard';
import { Colors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { mapApiProductsToUiProducts, mapApiProductToUiProduct } from '@/utils/productHelper';
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

                if (response.data.packagingOptions?.length) {
                    setSelectedOption(response.data.packagingOptions[0]);
                    setQuantity(response.data.packagingOptions[0].minQty || 1);
                }

                const suggestedResponse = await productApi.getSuggestedProducts(id);
                if (suggestedResponse.success && Array.isArray(suggestedResponse.data)) {
                    setSuggestedProducts(mapApiProductsToUiProducts(suggestedResponse.data));
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
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <View className="p-4">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                        <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                        <Text className="ml-2 text-base font-semibold text-gray-900">Back</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-base text-gray-500">{error || 'Product not found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const displayImages: string[] = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean) as string[];
    if (displayImages.length === 0) displayImages.push('https://via.placeholder.com/400?text=Product+Image');
    const hasPackagingOptions = (apiProduct?.packagingOptions?.length ?? 0) > 0;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="p-1">
                    <Icon name="arrow-back" size={24} color={Colors.textPrimary} library="material" />
                </TouchableOpacity>
                <Text className="flex-1 ml-3 text-lg font-bold text-gray-900" numberOfLines={1}>{product.name}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Image Section */}
                    <View className="bg-gray-50 py-5 items-center relative">
                        {(optionDiscount > 0 || (product.discount ?? 0) > 0) && (
                            <View className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-lg z-10 shadow-sm shadow-red-500/30">
                                <Text className="text-white text-xs font-extrabold tracking-wider">
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
                                <View key={index} style={{ width }} className="items-center justify-center">
                                    <Image source={{ uri }} style={{ width: width - 32, height: 300 }} resizeMode="contain" />
                                </View>
                            ))}
                        </ScrollView>
                        {displayImages.length > 1 && (
                            <View className="flex-row mt-4 gap-1.5">
                                {displayImages.map((_, i) => (
                                    <View key={i} className={`h-1.5 rounded-full ${i === activeImageIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300'}`} />
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="p-5">

                        {/* Title */}
                        <Text className="text-[22px] font-extrabold text-gray-900 leading-[28px] mb-1">{product.name}</Text>
                        {product.unit && (
                            <Text className="text-[13px] text-gray-500 font-medium mb-5">{product.unit}</Text>
                        )}

                        {/* Buying Options */}
                        {hasPackagingOptions && (
                            <View className="mb-6">
                                <Text className="text-[15px] font-extrabold text-gray-900 mb-3">Choose How to Buy</Text>
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
                                                className={`w-[148px] p-3 rounded-2xl border-2 relative bg-white ${isSelected ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/20' : 'border-gray-200'} ${outOfStock ? 'opacity-45' : ''}`}
                                            >
                                                {isSelected && (
                                                    <View className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-orange-500 items-center justify-center">
                                                        <Icon name="check" size={10} color="#fff" library="material" />
                                                    </View>
                                                )}

                                                {optDiscount > 0 && (
                                                    <View className="self-start bg-orange-100 px-1.5 py-0.5 rounded mb-2">
                                                        <Text className="text-[10px] font-bold text-orange-600">{optDiscount}% off</Text>
                                                    </View>
                                                )}

                                                <Text className={`text-[13px] font-bold leading-[18px] mb-0.5 ${isSelected ? 'text-orange-600' : 'text-gray-900'}`} numberOfLines={2}>
                                                    {opt.label}
                                                </Text>

                                                <Text className="text-[11px] text-gray-500 font-medium">
                                                    {opt.unitsPerPack} unit{opt.unitsPerPack !== 1 ? 's' : ''} / pack
                                                </Text>

                                                <View className="flex-row items-baseline gap-1 mt-1.5">
                                                    <Text className={`text-base font-extrabold ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
                                                        ₹{opt.salePrice}
                                                    </Text>
                                                    {opt.mrp > opt.salePrice && (
                                                        <Text className="text-xs text-gray-400 line-through">₹{opt.mrp}</Text>
                                                    )}
                                                </View>

                                                {opt.minQty > 1 && (
                                                    <Text className="text-[10px] text-gray-500 mt-1">Min {opt.minQty} packs</Text>
                                                )}

                                                <View className={`mt-2 px-2 py-1 rounded-md self-start ${outOfStock ? 'bg-red-50' : 'bg-green-50'}`}>
                                                    <Text className={`text-[10px] font-bold ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                                        {outOfStock ? 'Out of stock' : `${opt.stock} left`}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        {/* Price & Stock Block */}
                        <View className="flex-row justify-between items-center bg-gray-50 rounded-2xl p-4 border border-black/5 mb-6 shadow-sm shadow-black/5">
                            <View>
                                <View className="flex-row items-baseline gap-2">
                                    <Text className="text-[26px] font-extrabold text-gray-900">₹{activePrice}</Text>
                                    {hasOptionDiscount && (
                                        <Text className="text-sm text-gray-400 line-through">₹{activeMrp}</Text>
                                    )}
                                </View>
                                {hasOptionDiscount && (
                                    <Text className="text-xs font-bold text-green-600 mt-0.5">
                                        You save ₹{(activeMrp - activePrice).toFixed(2)} ({optionDiscount}% off)
                                    </Text>
                                )}
                                {selectedOption && (
                                    <Text className="text-[11px] text-gray-500 mt-1">
                                        {selectedOption.label} · {selectedOption.unitsPerPack} unit{selectedOption.unitsPerPack !== 1 ? 's' : ''} per pack
                                    </Text>
                                )}
                            </View>
                            <View className="items-end">
                                <View className={`px-2.5 py-1 rounded-md ${isInStock ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <Text className={`text-xs font-bold tracking-wider ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
                                        {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                    </Text>
                                </View>
                                {isInStock && activeStock <= 10 && (
                                    <Text className="text-[11px] text-red-500 font-semibold mt-1">Only {activeStock} left!</Text>
                                )}
                                <Text className="text-[11px] text-gray-500 mt-0.5">
                                    Incl. all taxes {product.gstRate ? `(${product.gstRate}% GST)` : ''}
                                </Text>
                            </View>
                        </View>

                        {/* Quantity Selector */}
                        <View className="mb-6">
                            <Text className="text-[15px] font-extrabold text-gray-900 mb-3">
                                Quantity{selectedOption ? ` (packs)` : ''}
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center bg-gray-100 rounded-xl p-1">
                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= activeMinQty}
                                        className={`w-11 h-11 bg-white rounded-lg items-center justify-center shadow-sm shadow-black/10 ${quantity <= activeMinQty ? 'opacity-40' : ''}`}
                                    >
                                        <Icon name="remove" size={20} color={Colors.textPrimary} library="material" />
                                    </TouchableOpacity>
                                    <View className="w-14 items-center">
                                        <Text className="text-lg font-extrabold text-gray-900">{quantity}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= activeStock}
                                        className={`w-11 h-11 bg-orange-500 rounded-lg items-center justify-center shadow-sm ${quantity >= activeStock ? 'opacity-40' : ''}`}
                                    >
                                        <Icon name="add" size={20} color="#fff" library="material" />
                                    </TouchableOpacity>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[11px] text-gray-500">Total</Text>
                                    <Text className="text-xl font-extrabold text-gray-900">
                                        ₹{(activePrice * quantity).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            {activeMinQty > 1 && (
                                <Text className="text-[11px] text-gray-500 mt-2.5 leading-4">
                                    ℹ️ Minimum order is {activeMinQty} pack{activeMinQty > 1 ? 's' : ''} for this option
                                </Text>
                            )}
                        </View>

                        {/* Product Details Table */}
                        <View className="mb-6">
                            <Text className="text-[15px] font-extrabold text-gray-900 mb-3">Product Details</Text>
                            <View className="border border-gray-200 rounded-xl overflow-hidden">
                                {product.unit && (
                                    <View className="flex-row border-b border-gray-200 p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">Unit Type</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{product.unit}</Text>
                                    </View>
                                )}
                                {apiProduct?.brand && (
                                    <View className="flex-row border-b border-gray-200 p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">Brand</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{apiProduct.brand}</Text>
                                    </View>
                                )}
                                {product.perUnitWeightVolume && (
                                    <View className="flex-row border-b border-gray-200 p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">Net Weight/Vol</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{product.perUnitWeightVolume}</Text>
                                    </View>
                                )}
                                {product.gstRate && (
                                    <View className="flex-row border-b border-gray-200 p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">GST Rate</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{product.gstRate}%</Text>
                                    </View>
                                )}
                                <View className="flex-row border-b border-gray-200 p-3">
                                    <Text className="flex-1 text-gray-500 text-[13px]">Availability</Text>
                                    <Text className={`flex-1 text-[13px] font-semibold ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
                                        {isInStock ? 'In Stock' : 'Out of Stock'}
                                    </Text>
                                </View>
                                {apiProduct?.manfDate && (
                                    <View className="flex-row border-b border-gray-200 p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">MFG Date</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{formatSafeDate(apiProduct.manfDate)}</Text>
                                    </View>
                                )}
                                {apiProduct?.expiryDate && (
                                    <View className="flex-row p-3">
                                        <Text className="flex-1 text-gray-500 text-[13px]">EXP Date</Text>
                                        <Text className="flex-1 text-gray-900 text-[13px] font-semibold">{formatSafeDate(apiProduct.expiryDate)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Description */}
                        {product.description && (
                            <View className="mb-6">
                                <Text className="text-[15px] font-extrabold text-gray-900 mb-3">Description</Text>
                                <Text className="text-sm text-gray-600 leading-6">{product.description}</Text>
                            </View>
                        )}

                        {/* Add to Cart Button */}
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            disabled={!isInStock}
                            activeOpacity={0.85}
                            className={`flex-row items-center justify-center gap-2.5 py-4 rounded-2xl shadow-sm shadow-orange-500/25 ${isInStock ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <Icon name="shopping-cart" size={20} color="#fff" library="material" />
                            <Text className="text-[15px] font-extrabold text-white tracking-wider">
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
                            <View className="h-3 bg-gray-100 mb-6" />
                            <View className="pb-6">
                                <Text className="text-[15px] font-extrabold text-gray-900 px-4 mb-4">
                                    You Might Also Like
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                                >
                                    {suggestedProducts.map((item) => (
                                        <View key={item.id} className="w-[154px]">
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
