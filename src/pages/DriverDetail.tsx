import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { driverService } from '../api/services/driver.service';
// Assuming orderService exists to get related orders
import { orderService } from '../api/services/order.service';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Tabs } from '../components/ui/Tabs';
import { ChartCard } from '../components/dashboard/ChartCard';
import { DataTable } from '../components/tables/DataTable';
import { 
  ArrowLeft, User, Truck, 
  FileText, CheckCircle, Clock, MapPin, Eye, Star
} from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export const DriverDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const { data: driver, isLoading: isDriverLoading } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driverService.getDriverById(id as string),
    enabled: !!id
  });

  const { data: allOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
    enabled: activeTab === 'orders'
  });

  // Simulated Live Location State
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (driver?.location && activeTab === 'location') {
      setLiveLocation(driver.location);
      
      const interval = setInterval(() => {
        setLiveLocation(prev => {
          if (!prev) return prev;
          // Simulate movement by randomly tweaking coordinates
          return {
            lat: prev.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.lng + (Math.random() - 0.5) * 0.001
          };
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [driver, activeTab]);

  const onLoad = useCallback(function callback() {
    // Optional map load logic
  }, []);

  const onUnmount = useCallback(function callback() {
    // Optional map unmount logic
  }, []);


  if (isDriverLoading || !driver) return <LoadingSpinner fullScreen />;

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'vehicle', label: 'Vehicle Info' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'orders', label: 'Orders' },
    { id: 'location', label: 'Live Location' },
  ];

  const driverOrders = allOrders.filter(o => o.driverId === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/drivers')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-100">
             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} alt={driver.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
              <StatusBadge status={driver.status} type="driver" />
            </div>
            <p className="text-sm text-gray-500">ID: {driver.id} • Registered {new Date(driver.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-[var(--color-brand-600)]" /> Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                   <p className="text-gray-900 font-medium">{driver.name}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                   <p className="text-gray-900">{driver.phone}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                   <p className="text-blue-600 hover:underline">{driver.email}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Company</p>
                   <p className="text-gray-900">{driver.companyId}</p>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                 <p className="text-sm text-gray-500 mb-2">Driver Rating</p>
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    <span className="text-4xl font-bold text-gray-900">{driver.rating?.toFixed(1) || '0.0'}</span>
                 </div>
                 <p className="text-xs text-gray-400">Based on {driver.deliveries || 0} deliveries</p>
             </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">KYC Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { name: 'Driving License', status: 'VERIFIED', date: '2025-01-15' },
               { name: 'National ID Proof', status: 'VERIFIED', date: '2025-01-15' },
               { name: 'Background Check', status: 'PENDING', date: '2025-02-01' }
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
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Vehicle Info Tab */}
      {activeTab === 'vehicle' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Truck className="text-[var(--color-brand-600)]" /> Vehicle Information
          </h3>
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-gray-100 pb-4">
               <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Vehicle Type</p>
                 <p className="text-gray-900 font-medium capitalize">{driver.vehicleType}</p>
               </div>
               <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <Truck className="w-6 h-6" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">License Plate Number</p>
                  <p className="text-gray-900 font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg border border-gray-200">
                    {driver.licenseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Capacity / Weight Limit</p>
                  <p className="text-gray-900 font-medium">
                    {driver.vehicleType.toLowerCase() === 'bike' ? '20 kg' : 
                     driver.vehicleType.toLowerCase() === 'van' ? '500 kg' : '2000 kg'}
                  </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 flex flex-col justify-center">
                 <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
                 <p className="text-4xl font-bold text-green-600 mb-2">${(driver.earnings || 0).toLocaleString()}</p>
                 <p className="text-sm text-gray-500">Lifetime payouts</p>
             </div>
             <div className="col-span-2">
               <ChartCard 
                 title="Monthly Earnings Trend" 
                 type="bar" 
                 data={[
                   { month: 'Jan', earnings: 400 }, { month: 'Feb', earnings: 600 },
                   { month: 'Mar', earnings: 550 }, { month: 'Apr', earnings: 800 },
                   { month: 'May', earnings: 1100 }, { month: 'Jun', earnings: driver.earnings / 2 } // Mock calculation
                 ]}
                 dataKey="earnings" 
                 nameKey="month" 
                 color="#10b981" 
               />
             </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Delivery History</h3>
          </div>
          <DataTable 
            columns={[
              { accessorKey: 'id', header: 'Order ID' },
              { accessorKey: 'customerName', header: 'Customer' },
              { accessorKey: 'pickupAddress', header: 'Pickup' },
              { accessorKey: 'dropAddress', header: 'Dropoff' },
              { accessorKey: 'price', header: 'Earnings', cell: (info: any) => `$${(info.getValue() * 0.8).toFixed(2)}` }, // assuming 80% to driver
              { accessorKey: 'status', header: 'Status', cell: (info: any) => <StatusBadge status={info.getValue()} type="order" /> },
            ]}
            data={driverOrders}
            isLoading={isOrdersLoading}
          />
        </div>
      )}

      {/* Live Location Tab */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-semibold text-gray-900 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Live GPS Tracking
             </h3>
             {liveLocation && (
               <span className="text-xs font-mono bg-white px-3 py-1.5 rounded border border-gray-200 flex items-center gap-2 text-gray-600">
                 <MapPin className="w-3 h-3" />
                 {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
               </span>
             )}
          </div>
          <div className="flex-1 relative">
            {!isLoaded ? (
              <LoadingSpinner fullScreen />
            ) : liveLocation ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={liveLocation}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
              >
                <Marker 
                  position={liveLocation} 
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Location data unavailable</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
