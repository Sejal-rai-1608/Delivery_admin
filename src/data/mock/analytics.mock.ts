import { Analytics } from '../../types';

export const mockAnalytics: Analytics = {
  totalRevenue: 245000,
  activeOrders: 142,
  totalCompanies: 45,
  totalDrivers: 128,
  revenueChart: [
    { date: 'Mon', amount: 12000 },
    { date: 'Tue', amount: 15000 },
    { date: 'Wed', amount: 14000 },
    { date: 'Thu', amount: 18000 },
    { date: 'Fri', amount: 22000 },
    { date: 'Sat', amount: 25000 },
    { date: 'Sun', amount: 19000 },
  ],
};
