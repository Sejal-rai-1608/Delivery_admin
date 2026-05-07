import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import { Order, OrderStatus } from '../../types';

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    if (USE_MOCK) return mockHandlers.getOrders();
    const response = await apiClient.get(ENDPOINTS.ORDERS.BASE);
    return response.data;
  },
  getOrderById: async (id: string): Promise<Order> => {
    if (USE_MOCK) return mockHandlers.getOrderById(id);
    const response = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));
    return response.data;
  },
  updateOrderStatus: async (id: string, status: OrderStatus, reason?: string) => {
    if (USE_MOCK) return mockHandlers.updateOrderStatus(id, status, reason);
    const response = await apiClient.patch(ENDPOINTS.ORDERS.STATUS(id), { status, reason });
    return response.data;
  },
  reassignDriver: async (orderId: string, driverId: string) => {
    if (USE_MOCK) return mockHandlers.reassignDriver(orderId, driverId);
    const response = await apiClient.post(ENDPOINTS.ORDERS.REASSIGN(orderId), { driverId });
    return response.data;
  }
};
