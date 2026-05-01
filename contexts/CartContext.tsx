import { cartApi } from '@/api/cartApi';
import { Cart, CartItem, Product } from '@/types';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { mapApiProductToUiProduct } from '@/utils/productHelper';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number, packagingOptionId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE = 0;

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  deliveryFee: DELIVERY_FEE,
  discount: 0,
  total: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);

  const apiTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingDiffs = useRef<Map<string, number>>(new Map());
  const isMounted = useRef(true);

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      apiTimers.current.forEach(t => clearTimeout(t));
      apiTimers.current.clear();
    };
  }, []);

  // Stable helper to build cart from items
  const buildCart = useCallback((items: CartItem[], discount = 0, couponCode?: string): Cart => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const deliveryFee = (subtotal >= 1000 || subtotal === 0) ? 0 : 50;
    const total = subtotal + deliveryFee - discount;
    return { items, subtotal, deliveryFee, discount, total, couponCode };
  }, []);

  // Stable fetchServerCart — uses functional setState so it doesn't need cart in deps
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data?.items && isMounted.current) {
        const mappedItems: CartItem[] = res.data.items.map((i: any) => {
          const apiProd = i.product;
          const uiProd = mapApiProductToUiProduct(apiProd);
          
          if (!uiProd) return null;

          let price = Number(i.price) || uiProd.price || 0;
          let packagingOptionLabel;

          if (i.packagingOptionId && apiProd?.packagingOptions) {
             const packOpt = apiProd.packagingOptions.find((p:any) => String(p._id) === String(i.packagingOptionId) || p.id === i.packagingOptionId);
             if (packOpt) {
                price = Number(packOpt.salePrice) || Number(packOpt.mrp) || price;
                packagingOptionLabel = packOpt.label;
             }
          }

          return {
            id: String(i._id || i.id || Date.now()),
            productId: String(uiProd.id),
            packagingOptionId: i.packagingOptionId,
            packagingOptionLabel,
            product: uiProd,
            quantity: Number(i.quantity || 1),
            price: Number(price),
            total: Number(price) * Number(i.quantity || 1),
          };
        }).filter((item: any) => item !== null);

        setCart(prev => buildCart(mappedItems, prev.discount, prev.couponCode));
      }
    } catch (e) {
      console.error('fetchServerCart error:', e);
    }
  }, [buildCart]);

  // Load cart when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      setCart(emptyCart);
    }
  }, [isAuthenticated, fetchServerCart]);

  const addToCart = useCallback(
    (product: Product, quantity: number, packagingOptionId?: string) => {
      if (!isAuthenticated) {
        showToast('Please login to add items to cart', 'info');
        router.push('/auth/login');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const itemKey = packagingOptionId ? `${product.id}_${packagingOptionId}` : product.id;

      // 1. Optimistic Update
      setCart(prev => {
        const existing = prev.items.find(i => (i as any).itemKey === itemKey || (!packagingOptionId && i.productId === product.id && !(i as any).packagingOptionId));
        let updatedItems: CartItem[];

        if (existing) {
          updatedItems = prev.items.map(item =>
            (item as any).itemKey === itemKey || (!packagingOptionId && item.productId === product.id && !(item as any).packagingOptionId)
              ? { ...item, quantity: item.quantity + quantity, total: item.price * (item.quantity + quantity) }
              : item
          );
        } else {
          let price = product.price || 0;
          let packagingOptionLabel;
          
          if (packagingOptionId && product.packagingOptions) {
             const packOpt = product.packagingOptions.find((p:any) => String(p._id) === String(packagingOptionId) || p.id === packagingOptionId);
             if (packOpt) {
                price = packOpt.salePrice || packOpt.mrp || price;
                packagingOptionLabel = packOpt.label;
             }
          }

          updatedItems = [
            ...prev.items,
            {
              id: Date.now().toString(),
              productId: product.id,
              product,
              quantity,
              price,
              total: price * quantity,
              itemKey,
              packagingOptionId,
              packagingOptionLabel
            } as any,
          ];
        }

        return buildCart(updatedItems, prev.discount, prev.couponCode);
      });

      showToast(`${product.name} added to cart`, 'success');

      // 2. Debounced API Sync with Net Change Tracking
      const currentDiff = pendingDiffs.current.get(itemKey) || 0;
      pendingDiffs.current.set(itemKey, currentDiff + quantity);

      const existingTimer = apiTimers.current.get(itemKey);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        apiTimers.current.delete(itemKey);
        const finalDiff = pendingDiffs.current.get(itemKey);
        pendingDiffs.current.delete(itemKey);

        if (finalDiff && finalDiff !== 0) {
          try {
            const res = await cartApi.addToCart(product.id, finalDiff, packagingOptionId);
            if (!res.success) fetchServerCart();
          } catch (e) {
            console.error('addToCart sync error:', e);
            fetchServerCart();
          }
        }
      }, 800);

      apiTimers.current.set(itemKey, timer);
    },
    [isAuthenticated, showToast, buildCart, fetchServerCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (!isAuthenticated) return;

      setCart(prev => {
        const updatedItems = prev.items.filter(i => i.productId !== productId);
        return buildCart(updatedItems, prev.discount, prev.couponCode);
      });

      showToast('Item removed from cart', 'info');

      // Clear any pending syncs for this product
      const existingTimer = apiTimers.current.get(productId);
      if (existingTimer) clearTimeout(existingTimer);
      apiTimers.current.delete(productId);
      pendingDiffs.current.delete(productId);

      const timer = setTimeout(async () => {
        try {
          const res = await cartApi.removeFromCart(productId);
          if (!res.success) fetchServerCart();
        } catch (e) {
          console.error('removeFromCart sync error:', e);
          fetchServerCart();
        }
      }, 100);

      apiTimers.current.set(`remove_${productId}`, timer);
    },
    [isAuthenticated, showToast, buildCart, fetchServerCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      let diff = 0;
      let minQty = 1;
      let shouldRemove = false;
      let itemKey = productId;

      setCart(prev => {
        const currentItem = prev.items.find(i => i.productId === productId);
        if (!currentItem) return prev;

        itemKey = (currentItem as any).itemKey || productId;
        minQty = currentItem.product?.minQuantity || 1;

        if (quantity <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          shouldRemove = true;
          return prev;
        }
        
        Haptics.selectionAsync();

        if (quantity < minQty && quantity > 0) return prev;

        diff = quantity - currentItem.quantity;
        if (diff === 0) return prev;

        const updatedItems = prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity, total: item.price * quantity }
            : item
        );
        return buildCart(updatedItems, prev.discount, prev.couponCode);
      });

      if (quantity > 0 && quantity < minQty) {
        showToast(`Minimum order quantity is ${minQty}`, 'info');
        return;
      }

      if (shouldRemove) {
        removeFromCart(productId);
        return;
      }

      if (diff === 0 || !isAuthenticated) return;

      // Track net change for debounced sync
      const currentPending = pendingDiffs.current.get(itemKey) || 0;
      pendingDiffs.current.set(itemKey, currentPending + diff);

      const existingTimer = apiTimers.current.get(itemKey);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        apiTimers.current.delete(itemKey);
        const finalDiff = pendingDiffs.current.get(itemKey);
        pendingDiffs.current.delete(itemKey);

        if (finalDiff && finalDiff !== 0) {
          try {
            await cartApi.addToCart(productId, finalDiff);
          } catch (e) {
            console.error('updateQuantity sync error:', e);
            fetchServerCart();
          }
        }
      }, 800);

      apiTimers.current.set(itemKey, timer);
    },
    [isAuthenticated, buildCart, removeFromCart, showToast, fetchServerCart]
  );

  const clearCart = useCallback(async () => {
    setCart(emptyCart);
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (e) {
        console.error('clearCart error:', e);
      }
    }
  }, [isAuthenticated]);

  const applyCoupon = useCallback((_code: string): boolean => {
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    setCart(prev => buildCart(prev.items, 0, undefined));
  }, [buildCart]);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.items.find(
        i => i.productId === productId || i.product?.id === productId
      );
      return item ? item.quantity : 0;
    },
    [cart.items]
  );

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
