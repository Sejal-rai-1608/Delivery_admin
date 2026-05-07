export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  COMPANIES: {
    BASE: '/companies',
    BY_ID: (id: string) => `/companies/${id}`,
    STATUS: (id: string) => `/companies/${id}/status`,
  },
  DRIVERS: {
    BASE: '/drivers',
    BY_ID: (id: string) => `/drivers/${id}`,
    STATUS: (id: string) => `/drivers/${id}/status`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
    REASSIGN: (id: string) => `/orders/${id}/reassign`,
  },
  ANALYTICS: {
    BASE: '/analytics',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITIES: '/dashboard/activities',
    LOCATIONS: '/dashboard/locations'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
  },
  SETTINGS: {
    BASE: '/settings',
    PLATFORM: '/settings/platform',
    ADMINS: '/settings/admins',
    ADMIN_BY_ID: (id: string) => `/settings/admins/${id}`,
    VEHICLES: '/settings/vehicle-types',
    VEHICLE_BY_ID: (id: string) => `/settings/vehicle-types/${id}`,
    BILLING: '/settings/billing',
    SECURITY: '/settings/security',
  },
  ADMIN: {
    AUDIT_LOGS: '/audit-logs',
    AUDIT_LOG_BY_ID: (id: string) => `/audit-logs/${id}`,
    AUDIT_LOGS_EXPORT: '/audit-logs/export',
  }
};
