import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';

export const dashboardService = {
  getDashboardStats: async () => {
    if (USE_MOCK) return mockHandlers.getDashboardStats();
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  },
  
  getRecentActivities: async () => {
    if (USE_MOCK) return mockHandlers.getRecentActivities();
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.ACTIVITIES);
    return response.data;
  },
  
  getDriverLocations: async () => {
    if (USE_MOCK) return mockHandlers.getDriverLocations();
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.LOCATIONS);
    return response.data;
  }
};
