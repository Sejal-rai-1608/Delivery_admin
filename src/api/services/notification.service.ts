import apiClient, { USE_MOCK } from '../client';
import { mockHandlers } from '../../mock/mockHandlers';
import { Notification } from '../../types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    if (USE_MOCK) return mockHandlers.getNotifications();
    const response = await apiClient.get('/notifications'); // Adjust endpoint as necessary
    return response.data;
  },
  getNotificationById: async (id: string): Promise<Notification> => {
    if (USE_MOCK) {
      const notifs = await mockHandlers.getNotifications();
      return notifs.find((n: any) => n.id === id) as Notification;
    }
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },
  createNotification: async (data: Partial<Notification>): Promise<Notification> => {
    if (USE_MOCK) return mockHandlers.createNotification(data);
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },
  resendNotification: async (id: string): Promise<Notification> => {
    if (USE_MOCK) return mockHandlers.resendNotification(id);
    const response = await apiClient.post(`/notifications/${id}/resend`);
    return response.data;
  },
  deleteNotification: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockHandlers.deleteNotification(id);
      return;
    }
    await apiClient.delete(`/notifications/${id}`);
  },
  markAsRead: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockHandlers.markNotificationRead(id);
      return;
    }
    await apiClient.patch(`/notifications/${id}/read`);
  }
};
