import { Cart, CartItem, Product } from '@/types';
import React, { createContext, useCallback, useContext, useState } from 'react';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    deliveryFee: DELIVERY_FEE,
    discount: 0,
    total: 0,
  });

  const { showToast } = useToast();

  const calculateCart = useCallback((items: CartItem[], discount: number = 0, couponCode?: string) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee - discount;

    return {
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((item) => item.productId === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = prevCart.items.map((item) =>
          item.productId === product.id
            ? {
              ...item,
              quantity: item.quantity + quantity,
              total: (item.quantity + quantity) * item.price,
            }
            : item
        );
      } else {
        newItems = [
          ...prevCart.items,
          {
            id: `ci-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            price: product.price,
            total: product.price * quantity,
          },
        ];
      }

      return calculateCart(newItems, prevCart.discount, prevCart.couponCode);
    });
    showToast(`Added ${product.name} to cart`, 'success');
  }, [calculateCart, showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId);
      return calculateCart(newItems, prevCart.discount, prevCart.couponCode);
    });
  }, [calculateCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity,
            total: item.price * quantity,
          }
          : item
      );
      return calculateCart(newItems, prevCart.discount, prevCart.couponCode);
    });
  }, [calculateCart, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      deliveryFee: DELIVERY_FEE,
      discount: 0,
      total: 0,
    });
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    // Mock coupon validation
    const validCoupons: Record<string, { discount: number; minOrder: number }> = {
      WELCOME50: { discount: 50, minOrder: 500 },
      SAVE20: { discount: 100, minOrder: 1000 }, // 20% of 1000 = 200, but max 200
    };

    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) return false;

    setCart((prevCart) => {
      if (prevCart.subtotal < coupon.minOrder) return prevCart;
      return calculateCart(prevCart.items, coupon.discount, code);
    });

    return true;
  }, [calculateCart]);

  const removeCoupon = useCallback(() => {
    setCart((prevCart) => calculateCart(prevCart.items, 0));
  }, [calculateCart]);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
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

