import axiosInstance from './axiosInstance';

export const cartApi = {
    getCart: async () => {
        try {
            const response = await axiosInstance.get('/cart');
            return response.data; // Expected: { success: true, data: Cart }
        } catch (error: any) {
            console.error("Get Cart Error", error);
            return { success: false, message: error.response?.data?.message || 'Failed to fetch cart' };
        }
    },

    addToCart: async (productId: string, quantity: number) => {
        try {
            const response = await axiosInstance.post('/cart/add', { productId, quantity });
            return response.data;
        } catch (error: any) {
            console.error("Add Cart Error", error);
            return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
        }
    },

    removeFromCart: async (productId: string) => {
        try {
            const response = await axiosInstance.delete(`/cart/remove/${productId}`);
            return response.data;
        } catch (error: any) {
            console.error("Remove Cart Error", error);
            return { success: false, message: error.response?.data?.message || 'Failed to remove from cart' };
        }
    },

    clearCart: async () => {
        try {
            const response = await axiosInstance.delete('/cart/clear'); // Common endpoint pattern
            return response.data;
        } catch (error: any) {
            console.error("Clear Cart Error", error);
            return { success: false, message: error.response?.data?.message || 'Failed to clear cart' };
        }
    },

    // Optional: Update quantity directly if API supports it, otherwise use add/remove logic
    // For now, assuming addToCart handles updates or we use remove/add combination
};
