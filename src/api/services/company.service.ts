import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import { Company, CompanyStatus } from '../../types';

export const companyService = {
  getCompanies: async (): Promise<Company[]> => {
    if (USE_MOCK) return mockHandlers.getCompanies();
    const response = await apiClient.get(ENDPOINTS.COMPANIES.BASE);
    return response.data;
  },
  getCompanyById: async (id: string): Promise<Company> => {
    if (USE_MOCK) return mockHandlers.getCompanyById(id);
    const response = await apiClient.get(ENDPOINTS.COMPANIES.BY_ID(id));
    return response.data;
  },
  updateCompanyStatus: async (id: string, status: CompanyStatus, reason?: string) => {
    if (USE_MOCK) return mockHandlers.updateCompanyStatus(id, status, reason);
    const response = await apiClient.patch(ENDPOINTS.COMPANIES.STATUS(id), { status, reason });
    return response.data;
  },
  reactivateCompany: async (id: string) => {
    if (USE_MOCK) return mockHandlers.updateCompanyStatus(id, 'APPROVED');
    const response = await apiClient.patch(ENDPOINTS.COMPANIES.STATUS(id), { status: 'APPROVED' });
    return response.data;
  }
};
