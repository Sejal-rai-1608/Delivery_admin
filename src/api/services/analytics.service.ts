import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import { Analytics } from '../../types';

export const analyticsService = {
  getAnalytics: async (): Promise<Analytics> => {
    if (USE_MOCK) return mockHandlers.getAnalytics();
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.BASE);
    return response.data;
  }
};
