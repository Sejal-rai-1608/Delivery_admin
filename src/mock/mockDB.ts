import {
  Company,
  Driver,
  Order,
  Analytics,
  Notification,
  AuditLog,
  CreateAuditLogInput,
  EnterpriseSettings,
  SettingsAdmin,
  VehicleType,
} from '../types';
import { mockCompanies } from '../data/mock/companies.mock';
import { mockDrivers } from '../data/mock/drivers.mock';
import { mockOrders } from '../data/mock/orders.mock';
import { mockAnalytics } from '../data/mock/analytics.mock';
import { mockNotifications } from '../data/mock/notifications.mock';
import { mockAuditLogs } from '../data/mock/auditLogs.mock';
import { useAuditLogStore } from '../store/auditLogStore';

// In-memory fake database
class MockDatabase {
  companies: Company[] = [...mockCompanies];
  drivers: Driver[] = [...mockDrivers];
  orders: Order[] = [...mockOrders];
  analytics: Analytics = { ...mockAnalytics };
  notifications: Notification[] = [...mockNotifications];
  auditLogs: AuditLog[] = [...mockAuditLogs];
  settings: EnterpriseSettings = {
    platform: {
      platformName: 'LogiX Admin',
      supportEmail: 'support@logix.com',
      supportPhone: '+1 415 555 0199',
      timezone: 'Asia/Calcutta',
      country: 'India',
      defaultCurrency: 'USD',
      logoUrl: 'https://dummyimage.com/160x64/7e22ce/ffffff&text=LogiX',
      faviconUrl: '/favicon.svg',
      enableRegistrations: true,
      enableLiveTracking: true,
      enablePushNotifications: true,
      enableAutoDriverAssignment: true,
      maintenanceMode: false,
      defaultLanguage: 'English',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: 'Symbol before amount',
    },
    billing: {
      platformCommission: 12,
      taxPercent: 8,
      cancellationFee: 5,
      minimumOrderCharge: 15,
      cashOnDelivery: true,
      walletPayments: true,
      onlinePayments: true,
      invoicePrefix: 'LGX',
      billingCycle: 'Monthly',
      currencySymbol: '$',
    },
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      templates: [
        { id: 'driver-assigned', name: 'Driver Assigned', subject: 'Driver assigned to order {{orderId}}', body: 'Hi {{customerName}}, {{driverName}} has been assigned to your order {{orderId}}.' },
        { id: 'order-cancelled', name: 'Order Cancelled', subject: 'Order {{orderId}} was cancelled', body: 'Your order {{orderId}} has been cancelled. Reason: {{reason}}.' },
        { id: 'order-delivered', name: 'Order Delivered', subject: 'Order {{orderId}} delivered', body: 'Your order {{orderId}} was delivered successfully. Thank you for using LogiX.' },
        { id: 'payment-received', name: 'Payment Received', subject: 'Payment received for {{orderId}}', body: 'We received {{amount}} for order {{orderId}}.' },
      ],
    },
    security: {
      sessionTimeout: 30,
      passwordMinimumLength: 10,
      loginAttemptLimit: 5,
      twoFactorAuthentication: true,
      deviceVerification: true,
      forcePasswordReset: false,
      permissions: {
        'Super Admin': {
          Dashboard: { view: true, edit: true, delete: true },
          Companies: { view: true, edit: true, delete: true },
          Drivers: { view: true, edit: true, delete: true },
          Orders: { view: true, edit: true, delete: true },
          Notifications: { view: true, edit: true, delete: true },
          Settings: { view: true, edit: true, delete: true },
          'Audit Logs': { view: true, edit: true, delete: false },
        },
        Manager: {
          Dashboard: { view: true, edit: false, delete: false },
          Companies: { view: true, edit: true, delete: false },
          Drivers: { view: true, edit: true, delete: false },
          Orders: { view: true, edit: true, delete: false },
          Notifications: { view: true, edit: true, delete: false },
          Settings: { view: true, edit: false, delete: false },
          'Audit Logs': { view: true, edit: false, delete: false },
        },
        Support: {
          Dashboard: { view: true, edit: false, delete: false },
          Companies: { view: true, edit: false, delete: false },
          Drivers: { view: true, edit: false, delete: false },
          Orders: { view: true, edit: true, delete: false },
          Notifications: { view: true, edit: false, delete: false },
          Settings: { view: false, edit: false, delete: false },
          'Audit Logs': { view: false, edit: false, delete: false },
        },
      },
    },
    content: {
      terms: 'These Terms and Conditions govern usage of the LogiX delivery platform, including account obligations, delivery operations, billing, and acceptable use.',
      privacy: 'LogiX collects operational, account, device, and transaction data to operate the logistics platform and comply with applicable regulations.',
      faq: 'Q: How do companies onboard drivers?\nA: Company admins submit driver documents for review from the Drivers module.',
      about: 'LogiX is an enterprise logistics operations platform for managing companies, drivers, orders, notifications, and compliance activity.',
    },
    integrations: {
      googleMapsApiKey: 'AIzaSy***************maps',
      firebaseConfig: '{ "projectId": "logix-prod", "messagingSenderId": "123456789" }',
      stripePublishableKey: 'pk_live_****************',
      stripeSecretKey: 'sk_live_****************',
      emailProvider: 'SendGrid',
      emailApiKey: 'SG.****************',
      statuses: {
        googleMaps: { connected: true, lastChecked: new Date().toISOString() },
        firebase: { connected: true, lastChecked: new Date().toISOString() },
        emailService: { connected: false, lastChecked: new Date().toISOString() },
      },
    },
  };
  platformSettings = this.settings.platform;
  admins: SettingsAdmin[] = [
    { id: 'admin-1', name: 'Aarav Mehta', email: 'aarav@logix.com', role: 'Super Admin', status: 'Active', lastLogin: '2026-05-06T14:35:00Z' },
    { id: 'admin-2', name: 'Priya Shah', email: 'priya@logix.com', role: 'Manager', status: 'Active', lastLogin: '2026-05-05T18:10:00Z' },
    { id: 'admin-3', name: 'Neha Kapoor', email: 'neha@logix.com', role: 'Support', status: 'Suspended', lastLogin: '2026-04-29T09:12:00Z' },
  ];
  vehicleTypes: VehicleType[] = [
    { id: 'veh-bike', name: 'Bike', iconUrl: 'https://dummyimage.com/80x80/ede9fe/7e22ce&text=B', maxWeight: 20, baseFare: 4, perKmRate: 0.8, description: 'Fast local deliveries for lightweight parcels.', active: true },
    { id: 'veh-van', name: 'Van', iconUrl: 'https://dummyimage.com/80x80/dbeafe/2563eb&text=V', maxWeight: 650, baseFare: 18, perKmRate: 2.2, description: 'Medium cargo and scheduled business deliveries.', active: true },
    { id: 'veh-truck', name: 'Truck', iconUrl: 'https://dummyimage.com/80x80/fef3c7/d97706&text=T', maxWeight: 3000, baseFare: 60, perKmRate: 5.5, description: 'Heavy freight and long distance logistics.', active: false },
  ];

  getAuditLogById(id: string) {
    return this.auditLogs.find((log) => log.id === id);
  }

  addAuditLog(input: CreateAuditLogInput) {
    const log: AuditLog = {
      ...input,
      id: input.id || `AUD-${Date.now()}`,
      timestamp: input.timestamp || new Date().toISOString(),
      metadata: {
        browser: input.metadata?.browser || 'Chrome 136',
        device: input.metadata?.device || 'Windows laptop',
        ipAddress: input.metadata?.ipAddress || '203.0.113.24',
        sessionId: input.metadata?.sessionId || `sess-${Date.now().toString(36)}`,
      },
    };

    this.auditLogs.unshift(log);
    useAuditLogStore.getState().appendLog(log);
    return log;
  }
}

export const db = new MockDatabase();
