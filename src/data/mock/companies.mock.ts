import { Company } from '../../types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Fast Track Logistics',
    email: 'contact@fasttrack.com',
    phone: '+1 (555) 123-4567',
    address: '123 Delivery Ave, New York, NY 10001',
    status: 'APPROVED',
    registrationDate: '2025-01-15T10:00:00Z',
    metrics: {
      totalOrders: 1450,
      activeDrivers: 45,
      revenue: 125000,
    },
  },
  {
    id: 'comp-2',
    name: 'Global Freight Co',
    email: 'info@globalfreight.com',
    phone: '+1 (555) 987-6543',
    address: '456 Shipping Blvd, Los Angeles, CA 90001',
    status: 'PENDING',
    registrationDate: '2026-04-20T14:30:00Z',
    metrics: {
      totalOrders: 0,
      activeDrivers: 0,
      revenue: 0,
    },
  },
  {
    id: 'comp-3',
    name: 'Swift Delivery Partners',
    email: 'hello@swiftdelivery.net',
    phone: '+1 (555) 456-7890',
    address: '789 Courier St, Chicago, IL 60601',
    status: 'SUSPENDED',
    registrationDate: '2025-08-10T09:15:00Z',
    metrics: {
      totalOrders: 890,
      activeDrivers: 12,
      revenue: 45000,
    },
  },
];
