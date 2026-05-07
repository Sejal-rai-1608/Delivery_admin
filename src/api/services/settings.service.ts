import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import {
  BillingSettings,
  EnterpriseSettings,
  PlatformSettings,
  SecuritySettings,
  SettingsAdmin,
  SettingsAdminInput,
  VehicleType,
  VehicleTypeInput,
} from '../../types';

export const settingsService = {
  getSettings: async (): Promise<EnterpriseSettings> => {
    if (USE_MOCK) return mockHandlers.getSettings();
    const response = await apiClient.get(ENDPOINTS.SETTINGS.BASE);
    return response.data;
  },

  updateSettings: async (settings: EnterpriseSettings): Promise<EnterpriseSettings> => {
    if (USE_MOCK) return mockHandlers.updateSettings(settings);
    const response = await apiClient.put(ENDPOINTS.SETTINGS.BASE, settings);
    return response.data;
  },

  updatePlatformSettings: async (settings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    if (USE_MOCK) return mockHandlers.updatePlatformSettings(settings);
    const response = await apiClient.patch(ENDPOINTS.SETTINGS.PLATFORM, settings);
    return response.data;
  },

  getAdmins: async (): Promise<SettingsAdmin[]> => {
    if (USE_MOCK) return mockHandlers.getAdmins();
    const response = await apiClient.get(ENDPOINTS.SETTINGS.ADMINS);
    return response.data;
  },

  createAdmin: async (admin: SettingsAdminInput): Promise<SettingsAdmin> => {
    if (USE_MOCK) return mockHandlers.createAdmin(admin);
    const response = await apiClient.post(ENDPOINTS.SETTINGS.ADMINS, admin);
    return response.data;
  },

  updateAdmin: async (id: string, admin: Partial<SettingsAdminInput>): Promise<SettingsAdmin> => {
    if (USE_MOCK) return mockHandlers.updateAdmin(id, admin);
    const response = await apiClient.patch(ENDPOINTS.SETTINGS.ADMIN_BY_ID(id), admin);
    return response.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockHandlers.deleteAdmin(id);
      return;
    }
    await apiClient.delete(ENDPOINTS.SETTINGS.ADMIN_BY_ID(id));
  },

  resetAdminPassword: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockHandlers.resetAdminPassword(id);
      return;
    }
    await apiClient.post(`${ENDPOINTS.SETTINGS.ADMIN_BY_ID(id)}/reset-password`);
  },

  getVehicleTypes: async (): Promise<VehicleType[]> => {
    if (USE_MOCK) return mockHandlers.getVehicleTypes();
    const response = await apiClient.get(ENDPOINTS.SETTINGS.VEHICLES);
    return response.data;
  },

  createVehicleType: async (vehicle: VehicleTypeInput): Promise<VehicleType> => {
    if (USE_MOCK) return mockHandlers.createVehicleType(vehicle);
    const response = await apiClient.post(ENDPOINTS.SETTINGS.VEHICLES, vehicle);
    return response.data;
  },

  updateVehicleType: async (id: string, vehicle: Partial<VehicleTypeInput>): Promise<VehicleType> => {
    if (USE_MOCK) return mockHandlers.updateVehicleType(id, vehicle);
    const response = await apiClient.patch(ENDPOINTS.SETTINGS.VEHICLE_BY_ID(id), vehicle);
    return response.data;
  },

  deleteVehicleType: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockHandlers.deleteVehicleType(id);
      return;
    }
    await apiClient.delete(ENDPOINTS.SETTINGS.VEHICLE_BY_ID(id));
  },

  updateBilling: async (billing: BillingSettings): Promise<BillingSettings> => {
    if (USE_MOCK) return mockHandlers.updateBilling(billing);
    const response = await apiClient.patch(ENDPOINTS.SETTINGS.BILLING, billing);
    return response.data;
  },

  updateSecurity: async (security: SecuritySettings): Promise<SecuritySettings> => {
    if (USE_MOCK) return mockHandlers.updateSecurity(security);
    const response = await apiClient.patch(ENDPOINTS.SETTINGS.SECURITY, security);
    return response.data;
  },
};
