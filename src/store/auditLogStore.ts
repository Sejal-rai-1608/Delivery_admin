import { create } from 'zustand';
import { AuditLog } from '../types';

interface AuditLogState {
  logs: AuditLog[];
  setLogs: (logs: AuditLog[]) => void;
  appendLog: (log: AuditLog) => void;
}

const sortLogs = (logs: AuditLog[]) =>
  [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const useAuditLogStore = create<AuditLogState>()((set) => ({
  logs: [],
  setLogs: (logs) => set({ logs: sortLogs(logs) }),
  appendLog: (log) =>
    set((state) => ({
      logs: sortLogs([log, ...state.logs.filter((item) => item.id !== log.id)]),
    })),
}));
