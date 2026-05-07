export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: CompanyStatus;
  registrationDate: string;
  documentUrl?: string;
  metrics: {
    totalOrders: number;
    activeDrivers: number;
    revenue: number;
  };
}

export type DriverStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Driver {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  status: DriverStatus;
  vehicleType: string;
  licenseNumber: string;
  joinedDate: string;
  location?: { lat: number; lng: number };
  earnings: number;
  rating: number;
  deliveries: number;
}

export type OrderStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  companyId: string;
  driverId?: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropAddress: string;
  pickupLocation?: { lat: number; lng: number };
  dropLocation?: { lat: number; lng: number };
  status: OrderStatus;
  price: number;
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod?: string;
  createdAt: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Analytics {
  totalRevenue: number;
  activeOrders: number;
  totalCompanies: number;
  totalDrivers: number;
  revenueChart: { date: string; amount: number }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  audience?: string[];
  channels?: string[];
  status?: 'SENT' | 'SCHEDULED' | 'FAILED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  sentAt?: string;
  stats?: {
    delivered: number;
    failed: number;
    opened: number;
  };
  read: boolean;
  createdAt: string;
}

export type AuditActorRole = 'Super Admin' | 'Manager' | 'System';

export type AuditActionType =
  | 'Company Approved'
  | 'Company Rejected'
  | 'Company Suspended'
  | 'Driver Suspended'
  | 'Driver Approved'
  | 'Driver Rejected'
  | 'Order Assigned'
  | 'Order Cancelled'
  | 'Order Delivered'
  | 'Notification Sent'
  | 'Notification Deleted'
  | 'Settings Updated'
  | 'Login'
  | 'Logout';

export type AuditResourceType =
  | 'Company'
  | 'Driver'
  | 'Order'
  | 'Settings'
  | 'Notification'
  | 'System';

export type AuditSeverity = 'Info' | 'Warning' | 'Critical';
export type AuditStatus = 'Success' | 'Failed';

export type AuditChangeSet = Record<string, string | number | boolean | null | undefined>;

export interface AuditLogResourceIds {
  companyId?: string;
  driverId?: string;
  orderId?: string;
  notificationId?: string;
  settingsKey?: string;
}

export interface AuditMetadata {
  browser: string;
  device: string;
  ipAddress: string;
  sessionId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: AuditActorRole;
  action: AuditActionType;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName?: string;
  resourceIds?: AuditLogResourceIds;
  severity: AuditSeverity;
  status: AuditStatus;
  details: string;
  before: AuditChangeSet;
  after: AuditChangeSet;
  metadata: AuditMetadata;
  searchTags?: string[];
}

export type CreateAuditLogInput = Omit<AuditLog, 'id' | 'timestamp' | 'metadata'> & {
  id?: string;
  timestamp?: string;
  metadata?: Partial<AuditMetadata>;
};

export type SettingsRole = 'Super Admin' | 'Manager' | 'Support';
export type SettingsAdminStatus = 'Active' | 'Suspended' | 'Pending';
export type PermissionModule =
  | 'Dashboard'
  | 'Companies'
  | 'Drivers'
  | 'Orders'
  | 'Notifications'
  | 'Settings'
  | 'Audit Logs';
export type PermissionAction = 'view' | 'edit' | 'delete';

export type RolePermissions = Record<SettingsRole, Record<PermissionModule, Record<PermissionAction, boolean>>>;

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  country: string;
  defaultCurrency: string;
  logoUrl: string;
  faviconUrl: string;
  enableRegistrations: boolean;
  enableLiveTracking: boolean;
  enablePushNotifications: boolean;
  enableAutoDriverAssignment: boolean;
  maintenanceMode: boolean;
  defaultLanguage: string;
  dateFormat: string;
  currencyFormat: string;
}

export interface BillingSettings {
  platformCommission: number;
  taxPercent: number;
  cancellationFee: number;
  minimumOrderCharge: number;
  cashOnDelivery: boolean;
  walletPayments: boolean;
  onlinePayments: boolean;
  invoicePrefix: string;
  billingCycle: string;
  currencySymbol: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  templates: NotificationTemplate[];
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordMinimumLength: number;
  loginAttemptLimit: number;
  twoFactorAuthentication: boolean;
  deviceVerification: boolean;
  forcePasswordReset: boolean;
  permissions: RolePermissions;
}

export interface ContentSettings {
  terms: string;
  privacy: string;
  faq: string;
  about: string;
}

export interface IntegrationConnection {
  connected: boolean;
  lastChecked: string;
}

export interface IntegrationSettings {
  googleMapsApiKey: string;
  firebaseConfig: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  emailProvider: string;
  emailApiKey: string;
  statuses: {
    googleMaps: IntegrationConnection;
    firebase: IntegrationConnection;
    emailService: IntegrationConnection;
  };
}

export interface EnterpriseSettings {
  platform: PlatformSettings;
  billing: BillingSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  content: ContentSettings;
  integrations: IntegrationSettings;
}

export interface SettingsAdmin {
  id: string;
  name: string;
  email: string;
  role: SettingsRole;
  status: SettingsAdminStatus;
  lastLogin: string;
}

export interface SettingsAdminInput {
  name: string;
  email: string;
  password?: string;
  role: SettingsRole;
  status?: SettingsAdminStatus;
}

export interface VehicleType {
  id: string;
  name: string;
  iconUrl: string;
  maxWeight: number;
  baseFare: number;
  perKmRate: number;
  description: string;
  active: boolean;
}

export type VehicleTypeInput = Omit<VehicleType, 'id'> & { id?: string };

export type AnalyticsDateRange = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';
export type AnalyticsGranularity = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsFilters {
  companies: string[];
  drivers: string[];
  orderStatuses: string[];
  vehicleTypes: string[];
  regions: string[];
  dateRange: AnalyticsDateRange;
  customStart?: string;
  customEnd?: string;
}

export interface AnalyticsFilterOptions {
  companies: string[];
  drivers: string[];
  orderStatuses: string[];
  vehicleTypes: string[];
  regions: string[];
}

export interface AnalyticsKpi {
  id: string;
  title: string;
  value: number;
  format: 'number' | 'currency' | 'percent' | 'time';
  growth: number;
  growthLabel: string;
  status: 'positive' | 'negative' | 'warning';
  trend: number[];
}

export interface TimeSeriesPoint {
  label: string;
  revenue: number;
  orders: number;
  commission?: number;
  completed?: number;
  cancellations?: number;
  rating?: number;
}

export interface NameValueMetric {
  name: string;
  value: number;
  growth?: number;
}

export interface RevenueAnalytics {
  kpis: AnalyticsKpi[];
  revenueOverTime: Record<AnalyticsGranularity, TimeSeriesPoint[]>;
  revenueByCompany: NameValueMetric[];
  revenueByVehicleType: NameValueMetric[];
  commission: {
    total: number;
    trend: TimeSeriesPoint[];
  };
}

export interface OrdersAnalytics {
  trend: TimeSeriesPoint[];
  byStatus: NameValueMetric[];
  peakHours: { hour: string; orders: number }[];
  distribution: {
    byCity: NameValueMetric[];
    byVehicleType: NameValueMetric[];
    byCompany: NameValueMetric[];
  };
}

export interface DriverLeaderboardRow {
  id: string;
  driver: string;
  rating: number;
  ordersCompleted: number;
  earnings: number;
  completionRate: number;
}

export interface DriverAnalytics {
  statusOverview: {
    online: number;
    offline: number;
    busy: number;
  };
  topDrivers: DriverLeaderboardRow[];
  performanceTrends: TimeSeriesPoint[];
  earnings: TimeSeriesPoint[];
}

export interface CompanyLeaderboardRow {
  id: string;
  company: string;
  revenue: number;
  orders: number;
  drivers: number;
  growth: number;
}

export interface CompanyAnalytics {
  topCompanies: CompanyLeaderboardRow[];
  growthTrends: TimeSeriesPoint[];
  approvalStats: NameValueMetric[];
}

export interface GeoAnalytics {
  center: { lat: number; lng: number };
  hotspots: { city: string; lat: number; lng: number; intensity: number; orders: number }[];
  activeDeliveries: { id: string; lat: number; lng: number; status: string }[];
  liveDrivers: { id: string; name: string; lat: number; lng: number; status: 'online' | 'busy' | 'offline' }[];
  routeDensity: { from: { lat: number; lng: number }; to: { lat: number; lng: number }; volume: number }[];
}

export interface OperationalMetric {
  label: string;
  value: number;
  unit: string;
  target: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface OperationalAnalytics {
  metrics: OperationalMetric[];
}

export interface LiveActivityEvent {
  id: string;
  type: 'driver_assigned' | 'order_completed' | 'company_approved' | 'order_cancelled' | 'payment_completed';
  title: string;
  description: string;
  timestamp: string;
}

export interface EnterpriseAnalytics {
  filterOptions: AnalyticsFilterOptions;
  revenue: RevenueAnalytics;
  orders: OrdersAnalytics;
  drivers: DriverAnalytics;
  companies: CompanyAnalytics;
  geo: GeoAnalytics;
  operational: OperationalAnalytics;
  activity: LiveActivityEvent[];
}
