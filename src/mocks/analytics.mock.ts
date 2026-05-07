import { EnterpriseAnalytics } from '../types';

export const analytics: EnterpriseAnalytics = {
  filterOptions: {
    companies: ['Fast Track Logistics', 'NorthStar Freight', 'Metro Move Express', 'Urban Courier Co', 'Prime Haulage'],
    drivers: ['John Doe', 'Carlos Rivera', 'Maya Chen', 'Fatima Khan', 'Ethan Brooks'],
    orderStatuses: ['Delivered', 'Pending', 'Cancelled', 'In Transit'],
    vehicleTypes: ['Truck', 'Van', 'Bike', 'Mini Truck'],
    regions: ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad'],
  },
  revenue: {
    kpis: [
      { id: 'orders', title: 'Total Orders', value: 18420, format: 'number', growth: 18, growthLabel: 'from last month', status: 'positive', trend: [12, 16, 14, 21, 24, 28] },
      { id: 'revenue', title: 'Total Revenue', value: 824500, format: 'currency', growth: 14, growthLabel: 'from last month', status: 'positive', trend: [30, 34, 31, 42, 46, 51] },
      { id: 'drivers', title: 'Active Drivers', value: 318, format: 'number', growth: 7, growthLabel: 'from last week', status: 'positive', trend: [18, 20, 22, 24, 27, 29] },
      { id: 'completion', title: 'Completion Rate', value: 92.4, format: 'percent', growth: 3.2, growthLabel: 'from last month', status: 'positive', trend: [80, 84, 86, 88, 90, 92] },
      { id: 'cancellation', title: 'Cancellation Rate', value: 4.8, format: 'percent', growth: -1.4, growthLabel: 'from yesterday', status: 'positive', trend: [8, 7, 6, 5.8, 5, 4.8] },
      { id: 'avgTime', title: 'Avg Delivery Time', value: 38, format: 'time', growth: -4, growthLabel: 'from yesterday', status: 'positive', trend: [48, 46, 44, 42, 40, 38] },
    ],
    revenueOverTime: {
      daily: [
        { label: 'Mon', revenue: 84200, orders: 1110, commission: 10104 },
        { label: 'Tue', revenue: 91250, orders: 1234, commission: 10950 },
        { label: 'Wed', revenue: 88700, orders: 1190, commission: 10644 },
        { label: 'Thu', revenue: 102400, orders: 1355, commission: 12288 },
        { label: 'Fri', revenue: 118900, orders: 1510, commission: 14268 },
        { label: 'Sat', revenue: 125300, orders: 1622, commission: 15036 },
        { label: 'Sun', revenue: 109800, orders: 1438, commission: 13176 },
      ],
      weekly: [
        { label: 'W1', revenue: 344000, orders: 4900, commission: 41280 },
        { label: 'W2', revenue: 398000, orders: 5320, commission: 47760 },
        { label: 'W3', revenue: 421000, orders: 5840, commission: 50520 },
        { label: 'W4', revenue: 472000, orders: 6360, commission: 56640 },
      ],
      monthly: [
        { label: 'Jan', revenue: 520000, orders: 9200, commission: 62400 },
        { label: 'Feb', revenue: 610000, orders: 10120, commission: 73200 },
        { label: 'Mar', revenue: 690000, orders: 11840, commission: 82800 },
        { label: 'Apr', revenue: 742000, orders: 13210, commission: 89040 },
        { label: 'May', revenue: 824500, orders: 18420, commission: 98940 },
      ],
    },
    revenueByCompany: [
      { name: 'Fast Track Logistics', value: 242000, growth: 18 },
      { name: 'NorthStar Freight', value: 196000, growth: 12 },
      { name: 'Metro Move Express', value: 158000, growth: 9 },
      { name: 'Urban Courier Co', value: 126000, growth: 22 },
      { name: 'Prime Haulage', value: 102500, growth: 6 },
    ],
    revenueByVehicleType: [
      { name: 'Truck', value: 38 },
      { name: 'Van', value: 29 },
      { name: 'Bike', value: 21 },
      { name: 'Mini Truck', value: 12 },
    ],
    commission: {
      total: 98940,
      trend: [
        { label: 'Jan', revenue: 520000, orders: 9200, commission: 62400 },
        { label: 'Feb', revenue: 610000, orders: 10120, commission: 73200 },
        { label: 'Mar', revenue: 690000, orders: 11840, commission: 82800 },
        { label: 'Apr', revenue: 742000, orders: 13210, commission: 89040 },
        { label: 'May', revenue: 824500, orders: 18420, commission: 98940 },
      ],
    },
  },
  orders: {
    trend: [
      { label: 'Mon', revenue: 84200, orders: 1110 },
      { label: 'Tue', revenue: 91250, orders: 1234 },
      { label: 'Wed', revenue: 88700, orders: 1190 },
      { label: 'Thu', revenue: 102400, orders: 1355 },
      { label: 'Fri', revenue: 118900, orders: 1510 },
      { label: 'Sat', revenue: 125300, orders: 1622 },
      { label: 'Sun', revenue: 109800, orders: 1438 },
    ],
    byStatus: [
      { name: 'Delivered', value: 12840 },
      { name: 'Pending', value: 2140 },
      { name: 'Cancelled', value: 884 },
      { name: 'In Transit', value: 2556 },
    ],
    peakHours: [
      { hour: '06:00', orders: 240 },
      { hour: '08:00', orders: 520 },
      { hour: '10:00', orders: 760 },
      { hour: '12:00', orders: 690 },
      { hour: '14:00', orders: 820 },
      { hour: '16:00', orders: 910 },
      { hour: '18:00', orders: 1040 },
      { hour: '20:00', orders: 730 },
    ],
    distribution: {
      byCity: [
        { name: 'Mumbai', value: 4220 },
        { name: 'Delhi', value: 3840 },
        { name: 'Bengaluru', value: 3360 },
        { name: 'Pune', value: 2840 },
        { name: 'Hyderabad', value: 2310 },
      ],
      byVehicleType: [
        { name: 'Truck', value: 4280 },
        { name: 'Van', value: 5860 },
        { name: 'Bike', value: 6240 },
        { name: 'Mini Truck', value: 2040 },
      ],
      byCompany: [
        { name: 'Fast Track Logistics', value: 5180 },
        { name: 'NorthStar Freight', value: 4210 },
        { name: 'Metro Move Express', value: 3580 },
        { name: 'Urban Courier Co', value: 2920 },
      ],
    },
  },
  drivers: {
    statusOverview: { online: 184, offline: 92, busy: 42 },
    topDrivers: [
      { id: 'drv-1', driver: 'John Doe', rating: 4.9, ordersCompleted: 642, earnings: 18400, completionRate: 96 },
      { id: 'drv-2', driver: 'Maya Chen', rating: 4.8, ordersCompleted: 594, earnings: 17120, completionRate: 94 },
      { id: 'drv-3', driver: 'Fatima Khan', rating: 4.7, ordersCompleted: 552, earnings: 16080, completionRate: 93 },
      { id: 'drv-4', driver: 'Carlos Rivera', rating: 4.6, ordersCompleted: 498, earnings: 14960, completionRate: 90 },
    ],
    performanceTrends: [
      { label: 'Jan', revenue: 0, orders: 920, completed: 850, cancellations: 42, rating: 4.4 },
      { label: 'Feb', revenue: 0, orders: 1040, completed: 980, cancellations: 38, rating: 4.5 },
      { label: 'Mar', revenue: 0, orders: 1180, completed: 1105, cancellations: 35, rating: 4.6 },
      { label: 'Apr', revenue: 0, orders: 1310, completed: 1230, cancellations: 31, rating: 4.7 },
      { label: 'May', revenue: 0, orders: 1420, completed: 1330, cancellations: 28, rating: 4.8 },
    ],
    earnings: [
      { label: 'Jan', revenue: 122000, orders: 920 },
      { label: 'Feb', revenue: 138000, orders: 1040 },
      { label: 'Mar', revenue: 151000, orders: 1180 },
      { label: 'Apr', revenue: 168000, orders: 1310 },
      { label: 'May', revenue: 184000, orders: 1420 },
    ],
  },
  companies: {
    topCompanies: [
      { id: 'cmp-1', company: 'Fast Track Logistics', revenue: 242000, orders: 5180, drivers: 84, growth: 18 },
      { id: 'cmp-2', company: 'NorthStar Freight', revenue: 196000, orders: 4210, drivers: 62, growth: 12 },
      { id: 'cmp-3', company: 'Metro Move Express', revenue: 158000, orders: 3580, drivers: 54, growth: 9 },
      { id: 'cmp-4', company: 'Urban Courier Co', revenue: 126000, orders: 2920, drivers: 44, growth: 22 },
    ],
    growthTrends: [
      { label: 'Jan', revenue: 18, orders: 920 },
      { label: 'Feb', revenue: 24, orders: 1040 },
      { label: 'Mar', revenue: 31, orders: 1180 },
      { label: 'Apr', revenue: 39, orders: 1310 },
      { label: 'May', revenue: 45, orders: 1420 },
    ],
    approvalStats: [
      { name: 'Approved', value: 45 },
      { name: 'Pending', value: 12 },
      { name: 'Suspended', value: 5 },
    ],
  },
  geo: {
    center: { lat: 19.076, lng: 72.8777 },
    hotspots: [
      { city: 'Mumbai', lat: 19.076, lng: 72.8777, intensity: 92, orders: 4220 },
      { city: 'Pune', lat: 18.5204, lng: 73.8567, intensity: 68, orders: 2840 },
      { city: 'Bengaluru', lat: 12.9716, lng: 77.5946, intensity: 74, orders: 3360 },
      { city: 'Delhi', lat: 28.6139, lng: 77.209, intensity: 81, orders: 3840 },
    ],
    activeDeliveries: [
      { id: 'ord-1001', lat: 19.11, lng: 72.88, status: 'In Transit' },
      { id: 'ord-1002', lat: 19.04, lng: 72.84, status: 'Assigned' },
      { id: 'ord-1003', lat: 19.14, lng: 72.91, status: 'Delayed' },
    ],
    liveDrivers: [
      { id: 'drv-1', name: 'John Doe', lat: 19.08, lng: 72.89, status: 'online' },
      { id: 'drv-2', name: 'Maya Chen', lat: 19.05, lng: 72.86, status: 'busy' },
      { id: 'drv-3', name: 'Fatima Khan', lat: 19.12, lng: 72.92, status: 'online' },
    ],
    routeDensity: [
      { from: { lat: 19.076, lng: 72.8777 }, to: { lat: 18.5204, lng: 73.8567 }, volume: 64 },
      { from: { lat: 19.076, lng: 72.8777 }, to: { lat: 19.14, lng: 72.91 }, volume: 92 },
    ],
  },
  operational: {
    metrics: [
      { label: 'Average Delivery Time', value: 38, unit: 'min', target: 45, status: 'healthy' },
      { label: 'Delayed Deliveries', value: 86, unit: 'orders', target: 120, status: 'warning' },
      { label: 'Failed Deliveries', value: 24, unit: 'orders', target: 40, status: 'healthy' },
      { label: 'Reassigned Orders', value: 112, unit: 'orders', target: 90, status: 'warning' },
      { label: 'Average Driver Response Time', value: 4.2, unit: 'min', target: 5, status: 'healthy' },
    ],
  },
  activity: [
    { id: 'evt-1', type: 'driver_assigned', title: 'Driver assigned', description: 'John Doe assigned to order ord-1008', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
    { id: 'evt-2', type: 'order_completed', title: 'Order completed', description: 'Order ord-1007 delivered in Mumbai', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'evt-3', type: 'payment_completed', title: 'Payment completed', description: '$240 received from NorthStar Freight', timestamp: new Date(Date.now() - 14 * 60000).toISOString() },
    { id: 'evt-4', type: 'company_approved', title: 'Company approved', description: 'Urban Courier Co approved by Super Admin', timestamp: new Date(Date.now() - 22 * 60000).toISOString() },
  ],
};
