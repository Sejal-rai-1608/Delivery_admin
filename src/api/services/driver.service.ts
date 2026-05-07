import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import { Driver, DriverStatus } from '../../types';

export const driverService = {
  getDrivers: async (): Promise<Driver[]> => {
    if (USE_MOCK) return mockHandlers.getDrivers();
    const response = await apiClient.get(ENDPOINTS.DRIVERS.BASE);
    return response.data;
  },
  getDriverById: async (id: string): Promise<Driver> => {
    if (USE_MOCK) return mockHandlers.getDriverById(id);
    const response = await apiClient.get(ENDPOINTS.DRIVERS.BY_ID(id));
    return response.data;
  },
  updateDriverStatus: async (id: string, status: DriverStatus, reason?: string) => {
    if (USE_MOCK) return mockHandlers.updateDriverStatus(id, status, reason);
    const response = await apiClient.patch(ENDPOINTS.DRIVERS.STATUS(id), { status, reason });
    return response.data;
  },
  reactivateDriver: async (id: string) => {
    if (USE_MOCK) return mockHandlers.updateDriverStatus(id, 'APPROVED');
    const response = await apiClient.patch(ENDPOINTS.DRIVERS.STATUS(id), { status: 'APPROVED' });
    return response.data;
  }
};
