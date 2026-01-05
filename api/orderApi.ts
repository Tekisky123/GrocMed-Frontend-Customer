import axiosInstance from './axiosInstance';

export const orderApi = {
    placeOrder: async (orderData: { shippingAddress: any; paymentMethod: string }) => {
        try {
            const response = await axiosInstance.post('/order/placeOrder', orderData);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to place order' };
        }
    },

    getMyOrders: async () => {
        try {
            const response = await axiosInstance.get('/order/myOrders');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch orders' };
        }
    },

    getOrderDetails: async (orderId: string) => {
        try {
            const response = await axiosInstance.get(`/order/${orderId}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch order details' };
        }
    },

    trackOrder: async (orderId: string) => {
        try {
            const response = await axiosInstance.get(`/order/track/${orderId}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to track order' };
        }
    },
};
