import { cartApi } from '@/api/cartApi';
import { Cart, CartItem, Product } from '@/types';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
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

  const apiTimeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  const addToCart = useCallback((product: Product, quantity: number) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'info');
      router.push('/auth/login');
      return;
    }

    // 1. Optimistic UI Update (Immediate)
    setCart(prev => {
      const existingItem = prev.items.find(i => i.productId === product.id);
      let updatedItems;

      if (existingItem) {
        updatedItems = prev.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, total: item.price * (item.quantity + quantity) }
            : item
        );
      } else {
        updatedItems = [...prev.items, {
          id: Date.now().toString(),
          productId: product.id,
          product,
          quantity,
          price: product.price,
          total: product.price * quantity
        }];
      }

      const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
      const total = subtotal + prev.deliveryFee - prev.discount;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total
      };
    });

    showToast(`Added ${product.name} to cart`, 'success');

    // 2. Background API Sync
    if (apiTimeoutRefs.current[product.id]) {
      clearTimeout(apiTimeoutRefs.current[product.id]);
    }

    apiTimeoutRefs.current[product.id] = setTimeout(async () => {
      try {
        const res = await cartApi.addToCart(product.id, quantity);
        if (!res.success) {
           showToast('Cart sync failed', 'error');
           fetchServerCart(); // Rollback to server state if sync fails
        }
      } catch (e) {
         console.error('Cart sync error:', e);
      }
    }, 300);
  }, [isAuthenticated, showToast]);

  const removeFromCart = useCallback((productId: string) => {
    if (!isAuthenticated) return;

    // 1. Optimistic UI Update
    setCart(prev => {
      const updatedItems = prev.items.filter(i => i.productId !== productId);
      const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total: subtotal + prev.deliveryFee - prev.discount
      };
    });

    showToast('Item removed', 'success');

    // 2. Background API Sync
    setTimeout(async () => {
       try {
         const res = await cartApi.removeFromCart(productId);
         if (!res.success) {
            showToast('Failed to remove item', 'error');
            fetchServerCart(); // Rollback
         }
       } catch (e) {
          console.error('Remove item error:', e);
       }
    }, 100);
  }, [isAuthenticated, showToast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
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

    // 3. API Sync (Properly Debounced)
    if (isAuthenticated) {
      if (apiTimeoutRefs.current[productId]) {
        clearTimeout(apiTimeoutRefs.current[productId]);
      }
      
      apiTimeoutRefs.current[productId] = setTimeout(async () => {
        try {
          await cartApi.addToCart(productId, diff);
        } catch (e) {
          console.error("Failed to sync cart quantity", e);
        }
      }, 500); // 500ms debounce
    }
  }, [cart.items, isAuthenticated, removeFromCart, showToast]);

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

