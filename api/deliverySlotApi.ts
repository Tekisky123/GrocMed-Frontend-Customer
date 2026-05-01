import axiosInstance from './axiosInstance';

export interface DeliverySlot {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export interface AvailabilityResponse {
    isFull: boolean;
    maxOrders: number;
    currentOrders: number;
    availableSlots: DeliverySlot[];
    date: string;
}

export const deliverySlotApi = {
    getAvailability: async (date?: string): Promise<{ success: boolean; data: AvailabilityResponse }> => {
        try {
            const response = await axiosInstance.get('/delivery-slots/availability', {
                params: { date }
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                data: {
                    isFull: false,
                    maxOrders: 50,
                    currentOrders: 0,
                    availableSlots: [],
                    date: date || new Date().toISOString().split('T')[0]
                }
            };
        }
    }
};
