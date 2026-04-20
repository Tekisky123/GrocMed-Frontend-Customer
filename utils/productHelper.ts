import { Product as ApiProduct } from '@/api/productApi';
import { Product } from '@/types';

/**
 * Safely maps a backend Product object to the frontend Product type.
 * Includes defensive checks to prevent rendering crashes due to missing data.
 */
export const mapApiProductToUiProduct = (apiProduct: ApiProduct | null | undefined): Product | null => {
    if (!apiProduct || !apiProduct._id) return null;

    try {
        // Safe price calculation
        let price = apiProduct.offerPrice || apiProduct.mrp || 0;
        let originalPrice = apiProduct.offerPrice ? apiProduct.mrp : undefined;
        let discount = apiProduct.mrp && apiProduct.offerPrice
            ? Math.round(((apiProduct.mrp - apiProduct.offerPrice) / apiProduct.mrp) * 100)
            : 0;

        // Handle packaging options override
        if (apiProduct.packagingOptions && Array.isArray(apiProduct.packagingOptions) && apiProduct.packagingOptions.length > 0) {
            const firstOpt = apiProduct.packagingOptions[0];
            if (firstOpt) {
                price = Number(firstOpt.salePrice) || Number(firstOpt.mrp) || price;
                originalPrice = Number(firstOpt.mrp) > Number(firstOpt.salePrice) ? Number(firstOpt.mrp) : undefined;
                if (firstOpt.mrp && firstOpt.salePrice && firstOpt.mrp > firstOpt.salePrice) {
                    discount = Math.round(((firstOpt.mrp - firstOpt.salePrice) / firstOpt.mrp) * 100);
                }
            }
        }

        // Safe image selection
        const mainImage = (apiProduct.images && apiProduct.images.length > 0) 
            ? apiProduct.images[0] 
            : (apiProduct.image || 'https://via.placeholder.com/150');

        return {
            id: String(apiProduct._id),
            name: apiProduct.name || 'Unknown Product',
            description: apiProduct.description || '',
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            discount: discount > 0 ? discount : undefined,
            image: mainImage,
            images: Array.isArray(apiProduct.images) ? apiProduct.images : [],
            categoryId: String(apiProduct.category || ''),
            brandId: String(apiProduct.brand || ''),
            brand: String(apiProduct.brand || 'Generic'),
            category: String(apiProduct.category || 'General'),
            inStock: Boolean((apiProduct.stock || 0) > 0 && apiProduct.isActive !== false),
            stockQuantity: Number(apiProduct.stock || 0),
            unit: String(apiProduct.unitType || 'unit'),
            unitType: apiProduct.unitType,
            perUnitWeightVolume: apiProduct.perUnitWeightVolume,
            gstRate: apiProduct.gstRate ? Number(apiProduct.gstRate) : undefined,
            minQuantity: Number(apiProduct.minimumQuantity || 1),
            maxQuantity: 10, // Hardcoded limit for safety
            rating: 4.5, // Default rating if missing
            reviewCount: 0,
            ingredients: [],
            nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            },
            packagingOptions: Array.isArray(apiProduct.packagingOptions) ? apiProduct.packagingOptions : [],
            manfDate: apiProduct.manfDate,
            expiryDate: apiProduct.expiryDate,
        };
    } catch (error) {
        console.warn(`Failed to map product ${apiProduct._id}:`, error);
        return null;
    }
};

/**
 * Filters a list of API products and returns only valid UI products.
 */
export const mapApiProductsToUiProducts = (apiProducts: (ApiProduct | null | undefined)[] | null | undefined): Product[] => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    return apiProducts
        .map(mapApiProductToUiProduct)
        .filter((p): p is Product => p !== null);
};
