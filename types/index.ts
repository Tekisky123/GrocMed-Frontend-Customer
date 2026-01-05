// Type definitions for the FMCG Grocery App

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[]; // Added support for multiple images
  categoryId: string;
  brandId: string;
  brand: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  unit: string; // kg, g, L, ml, pcs, etc.
  unitType?: string;
  perUnitWeightVolume?: string;
  unitsPerUnitType?: number;
  singleUnitPrice?: number;
  minQuantity: number;
  maxQuantity: number;
  ingredients?: string[];
  nutrition?: NutritionInfo;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  isFavorite?: boolean;
  tags?: string[];
  expiryDate?: string;
  manfDate?: string;
  manufacturer?: string;
  barcode?: string;
  notifyCustomers?: boolean;
  isOffer?: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  helpful?: number;
}

export interface Category {
  id?: string; // Optional now, as API uses name as identifier
  name: string;
  icon?: string; // Keeping for backward compatibility if icon lib is used
  image?: string;
  description?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  productCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  // Optional UI-only fields if needed, but keeping strict to schema for core data
  name?: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | string;
  paymentStatus?: PaymentStatus;
  address?: Address;
  shippingAddress?: {
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  placedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  tracking?: OrderTracking[];
  couponCode?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderTracking {
  status: OrderStatus;
  timestamp: string;
  message: string;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  pan?: string;
  adhaar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  categoryId?: string;
  productId?: string;
  expiryDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'reminder' | 'system';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

