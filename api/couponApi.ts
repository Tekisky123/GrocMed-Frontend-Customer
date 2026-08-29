import axiosInstance from './axiosInstance';

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validUntil: string;
  perUserLimit?: number;
}

export const couponApi = {
  // Apply coupon code to cart subtotal
  applyCoupon: async (code: string, cartSubtotal: number) => {
    try {
      const response = await axiosInstance.post('/coupon/apply', {
        code,
        cartSubtotal,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply coupon',
      };
    }
  },

  // Get available active coupons
  getAvailableCoupons: async () => {
    try {
      const response = await axiosInstance.get('/coupon/available');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available coupons',
      };
    }
  },
};
