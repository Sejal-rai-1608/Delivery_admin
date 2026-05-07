import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../api/services/company.service';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Tabs } from '../components/ui/Tabs';
import { ChartCard } from '../components/dashboard/ChartCard';
import { DataTable } from '../components/tables/DataTable';
import { 
  ArrowLeft, Building2, MapPin, Mail, Phone, 
  FileText, CheckCircle, Clock, Download, Eye 
} from 'lucide-react';
// Simulating an order service import, if it exists
import { orderService } from '../api/services/order.service';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyById(id as string),
    enabled: !!id
  });

  const { data: allOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
    enabled: activeTab === 'history'
  });

  if (isCompanyLoading || !company) return <LoadingSpinner fullScreen />;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'history', label: 'History' },
  ];

  const companyOrders = allOrders.filter(o => o.companyId === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/companies')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <StatusBadge status={company.status} type="company" />
          </div>
          <p className="text-sm text-gray-500">ID: {company.id} • Registered {new Date(company.registrationDate).toLocaleDateString()}</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-[var(--color-brand-600)]" /> Company Information
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Company Name</p>
                  <p className="text-gray-900">{company.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{company.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Address
                  </p>
                  <p className="text-gray-900">{company.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                 <p className="text-sm text-gray-500 mb-1">Total Drivers</p>
                 <p className="text-2xl font-bold text-gray-900">{company.metrics?.activeDrivers || 0}</p>
               </div>
               <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                 <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                 <p className="text-2xl font-bold text-gray-900">{company.metrics?.totalOrders || 0}</p>
               </div>
               <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                 <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                 <p className="text-2xl font-bold text-gray-900">${(company.metrics?.revenue || 0).toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-brand-100)] text-[var(--color-brand-600)] rounded-full flex items-center justify-center font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">Primary Contact</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">{company.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{company.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Dummy Documents */}
             {[
               { name: 'Business License', status: 'VERIFIED', date: '2026-04-15' },
               { name: 'Tax ID Certificate', status: 'VERIFIED', date: '2026-04-15' },
               { name: 'Insurance Policy', status: 'PENDING', date: '2026-05-01' },
               { name: 'Fleet Registration', status: 'VERIFIED', date: '2026-04-20' },
             ].map((doc, i) => (
               <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/50">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-medium text-gray-900">{doc.name}</p>
                     <p className="text-xs text-gray-500">Uploaded {new Date(doc.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   {doc.status === 'VERIFIED' ? (
                     <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                       <CheckCircle className="w-3 h-3" /> VERIFIED
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                       <Clock className="w-3 h-3" /> PENDING
                     </span>
                   )}
                   <button className="text-gray-400 hover:text-[var(--color-brand-600)] transition-colors">
                     <Eye className="w-5 h-5" />
                   </button>
                   <button className="text-gray-400 hover:text-[var(--color-brand-600)] transition-colors">
                     <Download className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <ChartCard 
             title="Orders Trend" 
             type="area" 
             // Mock data for display
             data={[
               { date: 'Mon', orders: 12 }, { date: 'Tue', orders: 19 },
               { date: 'Wed', orders: 15 }, { date: 'Thu', orders: 22 },
               { date: 'Fri', orders: 28 }, { date: 'Sat', orders: 35 },
               { date: 'Sun', orders: 31 }
             ]}
             dataKey="orders" 
             nameKey="date" 
             color="#3b82f6" 
           />
           <ChartCard 
             title="Revenue Trend" 
             type="bar" 
             data={[
               { date: 'Mon', rev: 1200 }, { date: 'Tue', rev: 1900 },
               { date: 'Wed', rev: 1500 }, { date: 'Thu', rev: 2200 },
               { date: 'Fri', rev: 2800 }, { date: 'Sat', rev: 3500 },
               { date: 'Sun', rev: 3100 }
             ]}
             dataKey="rev" 
             nameKey="date" 
             color="#10b981" 
           />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
          </div>
          <DataTable 
            columns={[
              { accessorKey: 'id', header: 'Order ID' },
              { accessorKey: 'customerName', header: 'Customer' },
              { accessorKey: 'pickupAddress', header: 'Pickup' },
              { accessorKey: 'dropAddress', header: 'Dropoff' },
              { accessorKey: 'price', header: 'Price', cell: (info: any) => `$${info.getValue().toFixed(2)}` },
              { accessorKey: 'status', header: 'Status', cell: (info: any) => <StatusBadge status={info.getValue()} type="order" /> },
            ]}
            data={companyOrders}
            isLoading={isOrdersLoading}
          />
        </div>
      )}
    </div>
  );
};
