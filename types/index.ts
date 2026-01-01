// Type definitions for the FMCG Grocery App

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  categoryId: string;
  brandId: string;
  brand: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  unit: string; // kg, g, L, ml, pcs, etc.
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
  manufacturer?: string;
  barcode?: string;
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
  id: string;
  name: string;
  icon: string;
  image?: string;
  description?: string;
  productCount?: number;
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
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  address: Address;
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
  aadhaar?: string;
  pan?: string;
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

