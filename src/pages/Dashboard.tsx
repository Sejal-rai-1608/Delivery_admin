import React, { useEffect, useState } from 'react';
import { dashboardService } from '../api/services/dashboard.service';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { useSocketStore } from '../store/socketStore';

// Components
import { KPICard } from '../components/dashboard/KPICard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ActivityList } from '../components/dashboard/ActivityList';
import { AlertBox } from '../components/dashboard/AlertBox';
import { QuickActions } from '../components/dashboard/QuickActions';
import { LiveDriversMap } from '../components/maps/LiveDriversMap';

// Icons
import { Building2, Users, Package, DollarSign, Clock, ShieldAlert, Navigation, XCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 7 days');

  // Fetch Dashboard Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats', dateRange],
    queryFn: dashboardService.getDashboardStats,
    refetchInterval: 60000 // Refetch every 1m
  });

  // Fetch Recent Activities
  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['dashboardActivities'],
    queryFn: dashboardService.getRecentActivities,
    refetchInterval: 30000 // Refetch every 30s
  });

  // Fetch Initial Driver Locations
  const { data: initialLocations, isLoading: isLocationsLoading } = useQuery({
    queryKey: ['dashboardLocations'],
    queryFn: dashboardService.getDriverLocations,
    staleTime: Infinity // Only fetch once to seed the store
  });

  const { driverLocations, setInitialDrivers, updateDriverLocation } = useSocketStore();

  // Initialize socket store with drivers
  useEffect(() => {
    if (initialLocations && Object.keys(driverLocations).length === 0) {
      setInitialDrivers(initialLocations);
    }
  }, [initialLocations, setInitialDrivers, driverLocations]);

  // Simulate real-time movement
  useEffect(() => {
    if (Object.keys(driverLocations).length === 0) return;

    const interval = setInterval(() => {
      Object.values(driverLocations).forEach(driver => {
        // Only move if online or on delivery
        if (driver.status === 'offline') return;
        
        // Random small movement
        const dLat = (Math.random() - 0.5) * 0.005;
        const dLng = (Math.random() - 0.5) * 0.005;
        
        updateDriverLocation(driver.id, driver.lat + dLat, driver.lng + dLng);
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [driverLocations, updateDriverLocation]);

  if (isStatsLoading || isActivitiesLoading || isLocationsLoading || !stats || !activities) {
    return <LoadingSpinner fullScreen />;
  }

  const { kpis, charts } = stats;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Center</h1>
          <p className="text-sm text-gray-500">Live logistics overview and performance metrics.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           {['Today', 'Last 7 days', 'Last 30 days'].map(range => (
             <button
               key={range}
               onClick={() => setDateRange(range)}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                 dateRange === range 
                   ? 'bg-purple-100 text-purple-700' 
                   : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Revenue" value={`$${kpis.revenueToday.toLocaleString()}`} icon={DollarSign}
          growth={12.5} growthText="vs last week" colorScheme="green"
        />
        <KPICard 
          title="Active Deliveries" value={kpis.activeDeliveries} icon={Navigation}
          growth={5.2} colorScheme="blue"
        />
        <KPICard 
          title="Total Companies" value={kpis.totalCompanies} icon={Building2}
          colorScheme="purple"
        />
        <KPICard 
          title="Online Drivers" value={kpis.activeDrivers} icon={Users}
          colorScheme="orange"
        />
        
        {/* Secondary KPIs */}
        <KPICard 
          title="Pending Companies" value={kpis.pendingCompanies} icon={Clock}
          colorScheme="purple"
        />
        <KPICard 
          title="Pending Drivers" value={kpis.pendingDrivers} icon={ShieldAlert}
          colorScheme="orange"
        />
        <KPICard 
          title="Total Orders Today" value={kpis.totalOrdersToday} icon={Package}
          growth={18.1} colorScheme="blue"
        />
        <KPICard 
          title="Cancelled Orders" value={kpis.cancelledOrders} icon={XCircle}
          colorScheme="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Charts & Map) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard 
              title="Orders Trend" type="area" data={charts.ordersTrend} 
              dataKey="orders" nameKey="date" color="#8b5cf6" height={250} 
            />
            <ChartCard 
              title="Revenue Overview" type="bar" data={charts.revenueChart} 
              dataKey="totalRevenue" nameKey="date" color="#10b981" height={250} 
            />
          </div>
          
          <div className="h-[500px]">
            <LiveDriversMap drivers={Object.values(driverLocations)} />
          </div>
        </div>

        {/* Right Column (Alerts, Actions, Activities) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <AlertBox alerts={{
            pendingCompanies: kpis.pendingCompanies,
            pendingDrivers: kpis.pendingDrivers,
            failedOrders: kpis.cancelledOrders
          }} />
          
          <QuickActions />

          <div className="grid grid-cols-1 gap-6 flex-1">
             <ChartCard 
                title="Delivery Status" type="pie" data={charts.deliveryStatus} 
                dataKey="value" nameKey="name" 
                colors={['#8b5cf6', '#3b82f6', '#10b981', '#ef4444']} height={200} 
              />
          </div>

          <div className="flex-1 max-h-[400px]">
             <ActivityList data={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};
