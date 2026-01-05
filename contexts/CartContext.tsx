import { cartApi } from '@/api/cartApi';
import { Cart, CartItem, Product } from '@/types';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Import Auth Context
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE = 0; // Free delivery as requested
const FREE_DELIVERY_THRESHOLD = 0; // Always free

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    deliveryFee: DELIVERY_FEE,
    discount: 0,
    total: 0,
  });

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth(); // Check auth status

  // Fetch cart from server when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      // Clear cart or check local storage if we wanted to support guest cart (but requirement says Force Login)
      // For now, let's keep it empty or persist locally if needed. 
      // Based on "Navigate to login if not logged in", we imply strict auth cart.
      setCart({ items: [], subtotal: 0, deliveryFee: DELIVERY_FEE, discount: 0, total: 0 });
    }
  }, [isAuthenticated]);

  const fetchServerCart = async () => {
    const res = await cartApi.getCart();
    if (res.success && res.data) {
      // Assuming res.data.items matches our CartItem structure, or map it
      // We need to ensure the server response matches our UI Cart structure
      // For this implementation, we'll try to map it or assume structure.
      // If server returns raw items, we might need to calculate totals here or trust server totals.

      // Let's assume for now we construct the cart from items if server just returns items
      // Or if server returns full cart object
      // Mapping logic might be needed here depending on backend response.
      // For simplicity, let's assume we can map the items.

      // MOCK: Since we don't know exact backend shape, let's just assume it returns { items: [] } 
      // and we recalculate to be safe, or direct set if properties match.
      // Real backend probably returns list of { product, quantity }.

      // For now, let's just recalculate based on items if they have product details
      // If not, we might need to fetch product details. 
      // Assuming backend returns populated product.

      if (res.data.items) {
        const mappedItems = res.data.items.map((i: any) => ({
          id: i._id || i.id,
          productId: i.product._id || i.product.id,
          product: {
            ...i.product,
            id: i.product._id || i.product.id,
            image: i.product.images?.[0] || i.product.image || 'https://via.placeholder.com/150'
          },
          quantity: i.quantity,
          price: i.product.offerPrice || i.product.mrp || i.price,
          total: (i.product.offerPrice || i.product.mrp || i.price) * i.quantity
        }));
        calculateCart(mappedItems);
      }
    }
  };


  const calculateCart = useCallback((items: CartItem[], discount: number = 0, couponCode?: string) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 0; // Free Delivery
    const total = subtotal + deliveryFee - discount;

    const newCart = {
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
    };

    setCart(newCart);
    return newCart;
  }, []);

  const addToCart = useCallback(async (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'info');
      router.push('/auth/login');
      return;
    }

    // Optimistic UI Update first (or wait for API?)
    // Let's wait for API to ensure consistency

    // Call API
    const res = await cartApi.addToCart(product.id, quantity);

    if (res.success) {
      showToast(`Added ${product.name} to cart`, 'success');
      // Refresh cart from server to get updated state (easiest way to sync)
      fetchServerCart();
    } else {
      showToast(res.message || 'Failed to add to cart', 'error');
    }
  }, [isAuthenticated, showToast]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;

    const res = await cartApi.removeFromCart(productId);
    if (res.success) {
      fetchServerCart();
      showToast('Item removed', 'success');
    } else {
      showToast('Failed to remove item', 'error');
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    // 1. Calculate Difference
    const currentItem = cart.items.find(i => i.productId === productId);
    if (!currentItem) return;

    // Check minimum quantity requirement
    const minQty = currentItem.product.minQuantity || 1;

    // Prevent going below minimum quantity
    if (quantity < minQty && quantity > 0) {
      showToast(`Minimum order quantity for this product is ${minQty}`, 'info');
      return;
    }

    // Decrement from minimum to 0 or manual removal
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const diff = quantity - currentItem.quantity;
    if (diff === 0) return;

    // 2. Optimistic UI Update (Fast) with Recalculation
    setCart(prev => {
      const updatedItems = prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: item.price * quantity }
          : item
      ).filter(Boolean) as CartItem[];

      // Recalculate Totals
      const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
      const deliveryFee = 0; // Free Delivery
      const total = subtotal + deliveryFee - prev.discount;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        deliveryFee,
        total
      };
    });

    // 3. API Sync (Properly)
    if (isAuthenticated) {
      try {
        await cartApi.addToCart(productId, diff);
      } catch (e) {
        console.error("Failed to sync cart quantity", e);
      }
    }
  }, [cart.items, isAuthenticated, removeFromCart, showToast]); // Added showToast dep

  const clearCart = useCallback(async () => {
    // Optimistic clear
    setCart({
      items: [],
      subtotal: 0,
      deliveryFee: DELIVERY_FEE,
      discount: 0,
      total: 0,
    });

    // Server clear
    if (isAuthenticated) {
      await cartApi.clearCart();
    }
  }, [isAuthenticated]);

  const applyCoupon = useCallback((code: string): boolean => {
    // ... enable coupon logic if API supports it
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    // ...
  }, []);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = cart.items.find(item => item.productId === productId || (item.product && item.product.id === productId));
    return item ? item.quantity : 0;
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemCount,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

