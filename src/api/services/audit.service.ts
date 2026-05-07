import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { mockHandlers } from '../../mock/mockHandlers';
import { AuditLog, CreateAuditLogInput } from '../../types';

export type AuditExportFormat = 'csv' | 'pdf';

export const auditService = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (USE_MOCK) return mockHandlers.getAuditLogs();
    const response = await apiClient.get(ENDPOINTS.ADMIN.AUDIT_LOGS);
    return response.data;
  },

  getAuditLogById: async (id: string): Promise<AuditLog> => {
    if (USE_MOCK) return mockHandlers.getAuditLogById(id);
    const response = await apiClient.get(ENDPOINTS.ADMIN.AUDIT_LOG_BY_ID(id));
    return response.data;
  },

  createAuditLog: async (data: CreateAuditLogInput): Promise<AuditLog> => {
    if (USE_MOCK) return mockHandlers.createAuditLog(data);
    const response = await apiClient.post(ENDPOINTS.ADMIN.AUDIT_LOGS, data);
    return response.data;
  },

  exportAuditLogs: async (logs: AuditLog[], format: AuditExportFormat = 'csv'): Promise<Blob> => {
    if (USE_MOCK) return mockHandlers.exportAuditLogs(logs, format);
    const response = await apiClient.post(
      ENDPOINTS.ADMIN.AUDIT_LOGS_EXPORT,
      { logs, format },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
