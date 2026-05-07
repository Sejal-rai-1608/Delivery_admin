import { db } from './mockDB';
import {
  AuditLog,
  BillingSettings,
  CompanyStatus,
  CreateAuditLogInput,
  DriverStatus,
  EnterpriseSettings,
  OrderStatus,
  SecuritySettings,
  SettingsAdminInput,
  VehicleTypeInput,
} from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const adminMetadata = () => ({
  browser: 'Chrome 136',
  device: 'Windows laptop',
  ipAddress: '203.0.113.24',
  sessionId: `sess-${Date.now().toString(36)}`,
});

const formatStatus = (status: string) => status.replace('_', ' ');

const companyActionForStatus = (status: CompanyStatus): CreateAuditLogInput['action'] => {
  if (status === 'REJECTED') return 'Company Rejected';
  if (status === 'SUSPENDED') return 'Company Suspended';
  return 'Company Approved';
};

const driverActionForStatus = (status: DriverStatus): CreateAuditLogInput['action'] => {
  if (status === 'REJECTED') return 'Driver Rejected';
  if (status === 'SUSPENDED') return 'Driver Suspended';
  return 'Driver Approved';
};

const orderActionForStatus = (status: OrderStatus): CreateAuditLogInput['action'] => {
  if (status === 'CANCELLED') return 'Order Cancelled';
  if (status === 'DELIVERED') return 'Order Delivered';
  return 'Order Assigned';
};

const statusSeverity = (status: string) => {
  if (status === 'SUSPENDED' || status === 'FAILED') return 'Critical';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'Warning';
  return 'Info';
};

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const auditLogsToCsv = (logs: AuditLog[]) => {
  const headers = [
    'Log ID',
    'Timestamp',
    'Actor',
    'Actor Role',
    'Action',
    'Resource Type',
    'Resource ID',
    'Resource Name',
    'Severity',
    'Status',
    'Details',
    'Company ID',
    'Driver ID',
    'Order ID',
    'Notification ID',
    'IP Address',
    'Session ID',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.actor,
    log.actorRole,
    log.action,
    log.resourceType,
    log.resourceId,
    log.resourceName,
    log.severity,
    log.status,
    log.details,
    log.resourceIds?.companyId,
    log.resourceIds?.driverId,
    log.resourceIds?.orderId,
    log.resourceIds?.notificationId,
    log.metadata.ipAddress,
    log.metadata.sessionId,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
};

export const mockHandlers = {
  // Companies
  getCompanies: async () => {
    await delay(500);
    return [...db.companies];
  },
  getCompanyById: async (id: string) => {
    await delay(400);
    const company = db.companies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    return { ...company };
  },
  updateCompanyStatus: async (id: string, status: CompanyStatus, reason?: string) => {
    await delay(600);
    const index = db.companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');

    const company = db.companies[index];
    const previousStatus = company.status;
    db.companies[index] = { ...company, status };
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Super Admin',
      action: companyActionForStatus(status),
      resourceType: 'Company',
      resourceId: company.id,
      resourceName: company.name,
      resourceIds: { companyId: company.id },
      severity: statusSeverity(status),
      status: 'Success',
      details: `${company.name} status changed from ${formatStatus(previousStatus)} to ${formatStatus(status)}${reason ? `: ${reason}` : '.'}`,
      before: { status: previousStatus },
      after: { status, reason },
      metadata: adminMetadata(),
      searchTags: [company.id, company.name, company.email, status],
    });
    return { success: true };
  },

  // Drivers
  getDrivers: async () => {
    await delay(500);
    return [...db.drivers];
  },
  getDriverById: async (id: string) => {
    await delay(400);
    const driver = db.drivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    return { ...driver };
  },
  updateDriverStatus: async (id: string, status: DriverStatus, reason?: string) => {
    await delay(600);
    const index = db.drivers.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Driver not found');

    const driver = db.drivers[index];
    const previousStatus = driver.status;
    db.drivers[index] = { ...driver, status };
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Manager',
      action: driverActionForStatus(status),
      resourceType: 'Driver',
      resourceId: driver.id,
      resourceName: driver.name,
      resourceIds: { driverId: driver.id, companyId: driver.companyId },
      severity: statusSeverity(status),
      status: 'Success',
      details: `${driver.name} status changed from ${formatStatus(previousStatus)} to ${formatStatus(status)}${reason ? `: ${reason}` : '.'}`,
      before: { status: previousStatus },
      after: { status, reason },
      metadata: adminMetadata(),
      searchTags: [driver.id, driver.name, driver.companyId, driver.licenseNumber, status],
    });
    return { success: true };
  },

  // Orders
  getOrders: async () => {
    await delay(500);
    return [...db.orders];
  },
  getOrderById: async (id: string) => {
    await delay(400);
    const order = db.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return { ...order };
  },
  updateOrderStatus: async (id: string, status: OrderStatus, reason?: string) => {
    await delay(600);
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const order = db.orders[index];
    const previousStatus = order.status;
    db.orders[index] = {
      ...order,
      status,
      timeline: [...order.timeline, { status, timestamp: new Date().toISOString(), note: reason }],
    };
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Manager',
      action: orderActionForStatus(status),
      resourceType: 'Order',
      resourceId: order.id,
      resourceName: `Order ${order.id}`,
      resourceIds: { orderId: order.id, companyId: order.companyId, driverId: order.driverId },
      severity: statusSeverity(status),
      status: 'Success',
      details: `Order ${order.id} status changed from ${formatStatus(previousStatus)} to ${formatStatus(status)}${reason ? `: ${reason}` : '.'}`,
      before: { status: previousStatus },
      after: { status, reason },
      metadata: adminMetadata(),
      searchTags: [order.id, order.customerName, order.driverId, order.companyId].filter(Boolean) as string[],
    });
    return { success: true };
  },
  reassignDriver: async (orderId: string, driverId: string) => {
    await delay(500);
    const index = db.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = db.orders[index];
    const driver = db.drivers.find(d => d.id === driverId);
    const previousDriverId = order.driverId || 'Unassigned';
    db.orders[index] = { ...order, driverId };
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Manager',
      action: 'Order Assigned',
      resourceType: 'Order',
      resourceId: order.id,
      resourceName: `Order ${order.id}`,
      resourceIds: { orderId: order.id, companyId: order.companyId, driverId },
      severity: 'Info',
      status: 'Success',
      details: `Order ${order.id} assigned to ${driver?.name || driverId}.`,
      before: { driverId: previousDriverId },
      after: { driverId, driverName: driver?.name || driverId },
      metadata: adminMetadata(),
      searchTags: [order.id, driverId, driver?.name, order.customerName, order.companyId].filter(Boolean) as string[],
    });
    return { success: true };
  },

  // Analytics
  getAnalytics: async () => {
    await delay(400);
    return { ...db.analytics };
  },

  // Notifications
  getNotifications: async () => {
    await delay(300);
    return [...db.notifications];
  },
  markNotificationRead: async (id: string) => {
    await delay(200);
    const index = db.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      db.notifications[index].read = true;
    }
    return { success: true };
  },
  createNotification: async (data: any) => {
    await delay(600);
    const newNotif = {
      id: `notif-${Date.now()}`,
      ...data,
      stats: { delivered: 0, failed: 0, opened: 0 },
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(newNotif);
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Manager',
      action: 'Notification Sent',
      resourceType: 'Notification',
      resourceId: newNotif.id,
      resourceName: newNotif.title,
      resourceIds: { notificationId: newNotif.id },
      severity: newNotif.type === 'ERROR' ? 'Critical' : newNotif.type === 'WARNING' ? 'Warning' : 'Info',
      status: newNotif.status === 'FAILED' ? 'Failed' : 'Success',
      details: `Notification "${newNotif.title}" created for ${(newNotif.audience || ['all users']).join(', ')}.`,
      before: { status: 'DRAFT' },
      after: { status: newNotif.status || 'SENT', type: newNotif.type, priority: newNotif.priority || 'MEDIUM' },
      metadata: adminMetadata(),
      searchTags: [newNotif.id, newNotif.title, newNotif.message, ...(newNotif.audience || [])],
    });
    return newNotif;
  },
  deleteNotification: async (id: string) => {
    await delay(400);
    const index = db.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const [notification] = db.notifications.splice(index, 1);
      db.addAuditLog({
        actor: 'Admin User',
        actorRole: 'Manager',
        action: 'Notification Deleted',
        resourceType: 'Notification',
        resourceId: notification.id,
        resourceName: notification.title,
        resourceIds: { notificationId: notification.id },
        severity: 'Warning',
        status: 'Success',
        details: `Notification "${notification.title}" was deleted from history.`,
        before: { status: notification.status || 'SENT', title: notification.title },
        after: { status: 'DELETED' },
        metadata: adminMetadata(),
        searchTags: [notification.id, notification.title, notification.message],
      });
    }
    return { success: true };
  },
  resendNotification: async (id: string) => {
    await delay(500);
    const notif = db.notifications.find(n => n.id === id);
    if (!notif) throw new Error('Notification not found');
    const previousStatus = notif.status || 'SENT';
    const previousSentAt = notif.sentAt || null;
    notif.sentAt = new Date().toISOString();
    notif.status = 'SENT';
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Manager',
      action: 'Notification Sent',
      resourceType: 'Notification',
      resourceId: notif.id,
      resourceName: notif.title,
      resourceIds: { notificationId: notif.id },
      severity: notif.type === 'ERROR' ? 'Critical' : notif.type === 'WARNING' ? 'Warning' : 'Info',
      status: 'Success',
      details: `Notification "${notif.title}" resent successfully.`,
      before: { status: previousStatus, sentAt: previousSentAt },
      after: { status: 'SENT', sentAt: notif.sentAt },
      metadata: adminMetadata(),
      searchTags: [notif.id, notif.title, notif.message],
    });
    return { ...notif };
  },

  // Audit Logs
  getAuditLogs: async () => {
    await delay(300);
    return [...db.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  getAuditLogById: async (id: string) => {
    await delay(200);
    const log = db.getAuditLogById(id);
    if (!log) throw new Error('Audit log not found');
    return { ...log };
  },
  createAuditLog: async (data: CreateAuditLogInput) => {
    await delay(150);
    return db.addAuditLog(data);
  },
  exportAuditLogs: async (logs: AuditLog[], format: 'csv' | 'pdf' = 'csv') => {
    await delay(250);
    if (format === 'pdf') {
      throw new Error('PDF export is not enabled in the mock backend');
    }
    return new Blob([auditLogsToCsv(logs)], { type: 'text/csv;charset=utf-8' });
  },

  // Settings
  getSettings: async () => {
    await delay(350);
    return structuredClone(db.settings);
  },
  updateSettings: async (settings: EnterpriseSettings) => {
    await delay(500);
    const before = structuredClone(db.settings);
    db.settings = structuredClone(settings);
    db.platformSettings = db.settings.platform;
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Super Admin',
      action: 'Settings Updated',
      resourceType: 'Settings',
      resourceId: 'settings.enterprise',
      resourceName: 'Enterprise Settings',
      resourceIds: { settingsKey: 'settings.enterprise' },
      severity: 'Warning',
      status: 'Success',
      details: 'Enterprise settings were updated from the admin console.',
      before: { platformName: before.platform.platformName, commission: before.billing.platformCommission },
      after: { platformName: db.settings.platform.platformName, commission: db.settings.billing.platformCommission },
      metadata: adminMetadata(),
      searchTags: ['settings', 'platform', db.settings.platform.platformName, db.settings.platform.supportEmail],
    });
    return structuredClone(db.settings);
  },
  updatePlatformSettings: async (settings: Partial<typeof db.settings.platform>) => {
    await delay(500);
    const before = { ...db.settings.platform };
    db.settings.platform = { ...db.settings.platform, ...settings };
    db.platformSettings = db.settings.platform;
    db.addAuditLog({
      actor: 'Admin User',
      actorRole: 'Super Admin',
      action: 'Settings Updated',
      resourceType: 'Settings',
      resourceId: 'platform.general',
      resourceName: 'General Platform Settings',
      resourceIds: { settingsKey: 'platform.general' },
      severity: 'Warning',
      status: 'Success',
      details: 'General platform settings were updated from the admin console.',
      before: {
        platformName: before.platformName,
        supportEmail: before.supportEmail,
        maintenanceMode: before.maintenanceMode,
      },
      after: {
        platformName: db.settings.platform.platformName,
        supportEmail: db.settings.platform.supportEmail,
        maintenanceMode: db.settings.platform.maintenanceMode,
      },
      metadata: adminMetadata(),
      searchTags: ['settings', 'platform', db.settings.platform.platformName, db.settings.platform.supportEmail],
    });
    return { ...db.settings.platform };
  },
  updateBilling: async (billing: BillingSettings) => {
    await delay(400);
    db.settings.billing = { ...billing };
    return { ...db.settings.billing };
  },
  updateSecurity: async (security: SecuritySettings) => {
    await delay(400);
    db.settings.security = structuredClone(security);
    return structuredClone(db.settings.security);
  },
  getAdmins: async () => {
    await delay(300);
    return [...db.admins];
  },
  createAdmin: async (admin: SettingsAdminInput) => {
    await delay(450);
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status || 'Active',
      lastLogin: new Date().toISOString(),
    };
    db.admins.unshift(newAdmin);
    return { ...newAdmin };
  },
  updateAdmin: async (id: string, admin: Partial<SettingsAdminInput>) => {
    await delay(400);
    const index = db.admins.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Admin not found');
    db.admins[index] = { ...db.admins[index], ...admin };
    return { ...db.admins[index] };
  },
  deleteAdmin: async (id: string) => {
    await delay(350);
    db.admins = db.admins.filter((admin) => admin.id !== id);
    return { success: true };
  },
  resetAdminPassword: async (id: string) => {
    await delay(350);
    const admin = db.admins.find((item) => item.id === id);
    if (!admin) throw new Error('Admin not found');
    return { success: true };
  },
  getVehicleTypes: async () => {
    await delay(300);
    return [...db.vehicleTypes];
  },
  createVehicleType: async (vehicle: VehicleTypeInput) => {
    await delay(450);
    const newVehicle = { ...vehicle, id: vehicle.id || `veh-${Date.now()}` };
    db.vehicleTypes.unshift(newVehicle);
    return { ...newVehicle };
  },
  updateVehicleType: async (id: string, vehicle: Partial<VehicleTypeInput>) => {
    await delay(400);
    const index = db.vehicleTypes.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Vehicle type not found');
    db.vehicleTypes[index] = { ...db.vehicleTypes[index], ...vehicle };
    return { ...db.vehicleTypes[index] };
  },
  deleteVehicleType: async (id: string) => {
    await delay(350);
    db.vehicleTypes = db.vehicleTypes.filter((vehicle) => vehicle.id !== id);
    return { success: true };
  },

  // Dashboard
  getDashboardStats: async () => {
    await delay(400);
    return {
      kpis: {
        totalCompanies: db.companies.length,
        activeDrivers: db.drivers.filter(d => d.status === 'APPROVED').length,
        totalOrdersToday: db.orders.length, // simulating today
        revenueToday: db.analytics.totalRevenue,
        pendingCompanies: db.companies.filter(c => c.status === 'PENDING').length,
        pendingDrivers: db.drivers.filter(d => d.status === 'PENDING').length,
        activeDeliveries: db.orders.filter(o => o.status === 'IN_TRANSIT').length,
        cancelledOrders: db.orders.filter(o => o.status === 'CANCELLED').length,
      },
      charts: {
        ordersTrend: db.analytics.revenueChart.map(item => ({ date: item.date, orders: Math.floor(item.amount / 50) })),
        revenueChart: db.analytics.revenueChart,
        deliveryStatus: [
          { name: 'Pending', value: db.orders.filter(o => o.status === 'PENDING').length },
          { name: 'In Transit', value: db.orders.filter(o => o.status === 'IN_TRANSIT').length },
          { name: 'Delivered', value: db.orders.filter(o => o.status === 'DELIVERED').length },
          { name: 'Cancelled', value: db.orders.filter(o => o.status === 'CANCELLED').length },
        ]
      }
    };
  },
  getRecentActivities: async () => {
    await delay(300);
    return {
      companies: db.companies.slice(0, 5),
      drivers: db.drivers.slice(0, 5),
      orders: db.orders.slice(0, 5)
    };
  },
  getDriverLocations: async () => {
    await delay(300);
    // Initialize mock live locations from db
    return db.drivers.filter(d => d.status === 'APPROVED').map(d => ({
      id: d.id,
      name: d.name,
      lat: d.location?.lat || 19.0760, // Default to Mumbai
      lng: d.location?.lng || 72.8777,
      status: Math.random() > 0.5 ? 'online' : (Math.random() > 0.5 ? 'on_delivery' : 'offline')
    }));
  }
};
