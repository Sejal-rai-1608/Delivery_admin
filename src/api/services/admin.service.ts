import { AuditLog } from '../../types';
import { auditService } from './audit.service';

export const adminService = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return auditService.getAuditLogs();
  }
};
