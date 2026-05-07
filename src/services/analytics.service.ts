import apiClient, { USE_MOCK } from '../api/client';
import { analytics } from '../mocks/analytics.mock';
import {
  AnalyticsFilters,
  CompanyAnalytics,
  DriverAnalytics,
  EnterpriseAnalytics,
  GeoAnalytics,
  OperationalAnalytics,
  OrdersAnalytics,
  RevenueAnalytics,
} from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => structuredClone(value);

const simulateFilterImpact = <T>(value: T, filters?: AnalyticsFilters): T => {
  if (!filters) return clone(value);
  const activeFilters =
    filters.companies.length +
    filters.drivers.length +
    filters.orderStatuses.length +
    filters.vehicleTypes.length +
    filters.regions.length;
  if (activeFilters === 0) return clone(value);
  return clone(value);
};

export const analyticsService = {
  getAnalyticsDashboard: async (filters?: AnalyticsFilters): Promise<EnterpriseAnalytics> => {
    if (USE_MOCK) {
      await delay(450);
      return simulateFilterImpact(analytics, filters);
    }
    const response = await apiClient.get('/analytics/dashboard', { params: filters });
    return response.data;
  },

  getRevenueAnalytics: async (filters?: AnalyticsFilters): Promise<RevenueAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.revenue, filters);
    }
    const response = await apiClient.get('/analytics/revenue', { params: filters });
    return response.data;
  },

  getOrdersAnalytics: async (filters?: AnalyticsFilters): Promise<OrdersAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.orders, filters);
    }
    const response = await apiClient.get('/analytics/orders', { params: filters });
    return response.data;
  },

  getDriverAnalytics: async (filters?: AnalyticsFilters): Promise<DriverAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.drivers, filters);
    }
    const response = await apiClient.get('/analytics/drivers', { params: filters });
    return response.data;
  },

  getCompanyAnalytics: async (filters?: AnalyticsFilters): Promise<CompanyAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.companies, filters);
    }
    const response = await apiClient.get('/analytics/companies', { params: filters });
    return response.data;
  },

  getGeoAnalytics: async (filters?: AnalyticsFilters): Promise<GeoAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.geo, filters);
    }
    const response = await apiClient.get('/analytics/geo', { params: filters });
    return response.data;
  },

  getOperationalMetrics: async (filters?: AnalyticsFilters): Promise<OperationalAnalytics> => {
    if (USE_MOCK) {
      await delay(300);
      return simulateFilterImpact(analytics.operational, filters);
    }
    const response = await apiClient.get('/analytics/operational', { params: filters });
    return response.data;
  },

  exportReport: async (type: 'csv' | 'pdf' | 'revenue' | 'drivers' | 'orders') => {
    await delay(700);
    return { success: true, type };
  },
};
