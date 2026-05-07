import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Building2,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  Package,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { analyticsService } from '../services/analytics.service';
import { Card } from '../components/ui/Card';
import { AnalyticsFilters, AnalyticsGranularity, EnterpriseAnalytics, LiveActivityEvent } from '../types';
import { cn } from '../utils/cn';

const chartColors = ['#9333ea', '#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#06b6d4'];
const defaultFilters: AnalyticsFilters = {
  companies: [],
  drivers: [],
  orderStatuses: [],
  vehicleTypes: [],
  regions: [],
  dateRange: 'last30',
};

const currency = (value: number) => `$${value.toLocaleString()}`;
const percent = (value: number) => `${value}%`;
const number = (value: number) => value.toLocaleString();
const dateRangeLabels = {
  today: 'Today',
  last7: 'Last 7 Days',
  last30: 'Last 30 Days',
  thisMonth: 'This Month',
  custom: 'Custom Range',
};

const SkeletonGrid: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-36 animate-pulse rounded-xl bg-gray-100" />
      </Card>
    ))}
  </div>
);

const ChartShell: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }> = ({
  title,
  children,
  action,
  className,
}) => (
  <Card className={cn('min-h-[360px] transition hover:shadow-lg', className)}>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="h-[280px]">{children}</div>
  </Card>
);

const KpiCard: React.FC<{ kpi: EnterpriseAnalytics['revenue']['kpis'][number]; icon: React.ElementType }> = ({ kpi, icon: Icon }) => {
  const formatted = kpi.format === 'currency' ? currency(kpi.value) : kpi.format === 'percent' ? percent(kpi.value) : kpi.format === 'time' ? `${kpi.value} min` : number(kpi.value);
  const isPositive = kpi.status === 'positive';
  return (
    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatted}</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-3 text-[var(--color-brand-600)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className={cn('flex items-center gap-1 text-sm font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
          {kpi.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {kpi.growth > 0 ? '+' : ''}{kpi.growth}% <span className="font-normal text-gray-400">{kpi.growthLabel}</span>
        </div>
        <div className="flex h-8 items-end gap-0.5">
          {kpi.trend.map((point, index) => (
            <span key={index} className={cn('w-1.5 rounded-full', isPositive ? 'bg-green-400' : 'bg-red-400')} style={{ height: `${Math.max(8, point)}px` }} />
          ))}
        </div>
      </div>
    </Card>
  );
};

const MultiSelect: React.FC<{
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <select
      multiple
      value={value}
      onChange={(event) => onChange(Array.from(event.target.selectedOptions).map((option) => option.value))}
      className="h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
    >
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const HeatmapPanel: React.FC<{ analytics: EnterpriseAnalytics }> = ({ analytics }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'analytics-google-map',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><MapPin className="h-5 w-5 text-[var(--color-brand-600)]" /> Logistics Heatmap</h3>
          <p className="text-sm text-gray-500">Delivery hotspots, active delivery markers, live drivers, and route density.</p>
        </div>
        <div className="hidden gap-3 text-xs text-gray-500 sm:flex">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Hotspot</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Driver</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Delivery</span>
        </div>
      </div>
      <div className="h-[420px]">
        {isLoaded && import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={analytics.geo.center} zoom={9} options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false }}>
            {analytics.geo.hotspots.map((hotspot) => (
              <Marker key={hotspot.city} position={{ lat: hotspot.lat, lng: hotspot.lng }} title={`${hotspot.city}: ${hotspot.orders} orders`} />
            ))}
            {analytics.geo.liveDrivers.map((driver) => (
              <Marker key={driver.id} position={{ lat: driver.lat, lng: driver.lng }} title={`${driver.name} (${driver.status})`} />
            ))}
            {analytics.geo.activeDeliveries.map((delivery) => (
              <Marker key={delivery.id} position={{ lat: delivery.lat, lng: delivery.lng }} title={`${delivery.id}: ${delivery.status}`} />
            ))}
            {analytics.geo.routeDensity.map((route, index) => (
              <Polyline key={index} path={[route.from, route.to]} options={{ strokeColor: '#9333ea', strokeOpacity: 0.45, strokeWeight: Math.max(2, route.volume / 18) }} />
            ))}
          </GoogleMap>
        ) : (
          <div className="relative h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {analytics.geo.hotspots.map((hotspot, index) => (
              <div key={hotspot.city} className="absolute rounded-full border border-white bg-purple-500/80 text-white shadow-lg" style={{ left: `${18 + index * 18}%`, top: `${25 + (index % 2) * 28}%`, width: hotspot.intensity, height: hotspot.intensity }}>
                <span className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-bold">{hotspot.city}</span>
              </div>
            ))}
            {analytics.geo.liveDrivers.map((driver, index) => (
              <div key={driver.id} className="absolute h-3 w-3 animate-pulse rounded-full bg-green-500 ring-4 ring-green-100" style={{ left: `${30 + index * 16}%`, top: `${62 - index * 10}%` }} />
            ))}
            <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 p-3 text-xs text-gray-600 shadow-sm">Google Maps preview fallback. Add `VITE_GOOGLE_MAPS_API_KEY` for live map rendering.</div>
          </div>
        )}
      </div>
    </Card>
  );
};

const ActivityFeed: React.FC<{ events: LiveActivityEvent[] }> = ({ events }) => {
  const iconMap = {
    driver_assigned: Truck,
    order_completed: CheckCircle,
    company_approved: Building2,
    order_cancelled: Package,
    payment_completed: FileText,
  };

  return (
    <Card className="h-full">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900"><Activity className="h-5 w-5 text-[var(--color-brand-600)]" /> Live Activity Feed</h3>
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = iconMap[event.type];
          return (
            <div key={event.id} className="flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-purple-50 p-2 text-[var(--color-brand-600)]"><Icon className="h-5 w-5" /></div>
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">{event.description}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const Analytics: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [granularity, setGranularity] = useState<AnalyticsGranularity>('daily');
  const [showFilters, setShowFilters] = useState(true);
  const [liveEvents, setLiveEvents] = useState<LiveActivityEvent[]>([]);

  const query = useQuery({
    queryKey: ['enterprise-analytics', filters],
    queryFn: () => analyticsService.getAnalyticsDashboard(filters),
  });

  useEffect(() => {
    if (query.data) setLiveEvents(query.data.activity);
  }, [query.data]);

  useEffect(() => {
    const interval = setInterval(() => {
      const event: LiveActivityEvent = {
        id: `evt-live-${Date.now()}`,
        type: 'driver_assigned',
        title: 'Driver assigned',
        description: `Auto-assigned driver to order ord-${Math.floor(1100 + Math.random() * 300)}`,
        timestamp: new Date().toISOString(),
      };
      setLiveEvents((events) => [event, ...events].slice(0, 8));
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const activeChips = useMemo(() => [
    ...filters.companies.map((value) => ({ group: 'companies' as const, value })),
    ...filters.drivers.map((value) => ({ group: 'drivers' as const, value })),
    ...filters.orderStatuses.map((value) => ({ group: 'orderStatuses' as const, value })),
    ...filters.vehicleTypes.map((value) => ({ group: 'vehicleTypes' as const, value })),
    ...filters.regions.map((value) => ({ group: 'regions' as const, value })),
  ], [filters]);

  const updateMulti = (key: keyof Pick<AnalyticsFilters, 'companies' | 'drivers' | 'orderStatuses' | 'vehicleTypes' | 'regions'>, value: string[]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const exportReport = async (type: 'csv' | 'pdf' | 'revenue' | 'drivers' | 'orders') => {
    await analyticsService.exportReport(type);
    toast.success(`${type.toUpperCase()} export generated`);
  };

  if (query.isLoading || !query.data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="text-sm text-gray-500">Deep dive into platform performance metrics.</p></div>
        <SkeletonGrid />
      </div>
    );
  }

  const data = query.data;
  const kpiIcons = [Package, FileText, Users, CheckCircle, TrendingDown, Clock];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Real-time logistics intelligence across revenue, operations, drivers, companies, and geography.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filters.dateRange} onChange={(event) => setFilters({ ...filters, dateRange: event.target.value as AnalyticsFilters['dateRange'] })} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]">
            {Object.entries(dateRangeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <button onClick={() => query.refetch()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RefreshCcw className={cn('h-4 w-4', query.isFetching ? 'animate-spin' : '')} /> Refresh</button>
          <button onClick={() => exportReport('pdf')} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-600)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]"><FileText className="h-4 w-4" /> Export Report</button>
          <button onClick={() => exportReport('csv')} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Download className="h-4 w-4" /> CSV</button>
        </div>
      </div>

      <Card className="sticky top-16 z-[2] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Filter className="h-4 w-4 text-[var(--color-brand-600)]" /> Analytics Filters</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters((value) => !value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">{showFilters ? 'Collapse' : 'Expand'}</button>
            <button onClick={() => setFilters(defaultFilters)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Clear Filters</button>
          </div>
        </div>
        {showFilters && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MultiSelect label="Company" options={data.filterOptions.companies} value={filters.companies} onChange={(value) => updateMulti('companies', value)} />
            <MultiSelect label="Driver" options={data.filterOptions.drivers} value={filters.drivers} onChange={(value) => updateMulti('drivers', value)} />
            <MultiSelect label="Order Status" options={data.filterOptions.orderStatuses} value={filters.orderStatuses} onChange={(value) => updateMulti('orderStatuses', value)} />
            <MultiSelect label="Vehicle Type" options={data.filterOptions.vehicleTypes} value={filters.vehicleTypes} onChange={(value) => updateMulti('vehicleTypes', value)} />
            <MultiSelect label="City/Region" options={data.filterOptions.regions} value={filters.regions} onChange={(value) => updateMulti('regions', value)} />
          </div>
        )}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button key={`${chip.group}-${chip.value}`} onClick={() => updateMulti(chip.group, filters[chip.group].filter((item) => item !== chip.value))} className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[var(--color-brand-700)]">
                {chip.value}<X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {data.revenue.kpis.map((kpi, index) => <KpiCard key={kpi.id} kpi={kpi} icon={kpiIcons[index]} />)}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartShell title="Revenue Over Time" action={<div className="flex rounded-xl bg-gray-50 p-1 text-xs font-medium">{(['daily', 'weekly', 'monthly'] as AnalyticsGranularity[]).map((item) => <button key={item} onClick={() => setGranularity(item)} className={cn('rounded-lg px-3 py-1.5 capitalize', granularity === item ? 'bg-white text-[var(--color-brand-600)] shadow-sm' : 'text-gray-500')}>{item}</button>)}</div>}>
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenue.revenueOverTime[granularity]}><defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.35}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip formatter={(v) => currency(Number(v))} /><Legend /><Area type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} fill="url(#revenueGradient)" /></AreaChart></ResponsiveContainer>
          </ChartShell>
          <ChartShell title="Revenue By Company"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.revenue.revenueByCompany}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="name" hide /><YAxis tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip formatter={(v) => currency(Number(v))} /><Bar dataKey="value" fill="#9333ea" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Revenue By Vehicle Type"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.revenue.revenueByVehicleType} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>{data.revenue.revenueByVehicleType.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartShell>
          <ChartShell title={`Platform Commission Analytics (${currency(data.revenue.commission.total)})`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data.revenue.commission.trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip formatter={(v) => currency(Number(v))} /><Line type="monotone" dataKey="commission" stroke="#16a34a" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></ChartShell>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Order Analytics</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartShell title="Orders Trend Chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.orders.trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Orders By Status"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.orders.byStatus} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>{data.orders.byStatus.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Peak Delivery Hours"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.orders.peakHours}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="hour" /><YAxis /><Tooltip /><Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Orders Distribution By City"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.orders.distribution.byCity}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartShell>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Driver Analytics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-sm text-gray-500">Online Drivers</p><p className="mt-1 text-3xl font-bold text-green-600">{data.drivers.statusOverview.online}</p></Card>
          <Card><p className="text-sm text-gray-500">Offline Drivers</p><p className="mt-1 text-3xl font-bold text-gray-700">{data.drivers.statusOverview.offline}</p></Card>
          <Card><p className="text-sm text-gray-500">Busy Drivers</p><p className="mt-1 text-3xl font-bold text-orange-600">{data.drivers.statusOverview.busy}</p></Card>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Drivers Leaderboard</h3>
            <div className="overflow-x-auto"><table className="min-w-[620px] w-full text-left text-sm"><thead className="text-xs uppercase text-gray-500"><tr><th className="py-3">Driver</th><th>Rating</th><th>Completed</th><th>Earnings</th><th>Completion</th></tr></thead><tbody className="divide-y divide-gray-100">{data.drivers.topDrivers.map((driver) => <tr key={driver.id} className="hover:bg-gray-50"><td className="py-3 font-medium text-gray-900">{driver.driver}</td><td>{driver.rating}</td><td>{driver.ordersCompleted}</td><td>{currency(driver.earnings)}</td><td>{driver.completionRate}%</td></tr>)}</tbody></table></div>
          </Card>
          <ChartShell title="Driver Performance Trends"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.drivers.performanceTrends}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={3} /><Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Driver Earnings Analytics" className="xl:col-span-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.drivers.earnings}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis tickFormatter={(v) => `$${v / 1000}k`} /><Tooltip formatter={(v) => currency(Number(v))} /><Area type="monotone" dataKey="revenue" stroke="#9333ea" fill="#f3e8ff" strokeWidth={3} /></AreaChart></ResponsiveContainer></ChartShell>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Company Analytics</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Companies</h3>
            <div className="overflow-x-auto"><table className="min-w-[620px] w-full text-left text-sm"><thead className="text-xs uppercase text-gray-500"><tr><th className="py-3">Company</th><th>Revenue</th><th>Orders</th><th>Drivers</th><th>Growth</th></tr></thead><tbody className="divide-y divide-gray-100">{data.companies.topCompanies.map((company) => <tr key={company.id} className="hover:bg-gray-50"><td className="py-3 font-medium text-gray-900">{company.company}</td><td>{currency(company.revenue)}</td><td>{company.orders}</td><td>{company.drivers}</td><td className="text-green-600">+{company.growth}%</td></tr>)}</tbody></table></div>
          </Card>
          <ChartShell title="Company Growth Trends"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.companies.growthTrends}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" name="Companies" stroke="#9333ea" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartShell>
          <ChartShell title="Company Approval Stats"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.companies.approvalStats} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>{data.companies.approvalStats.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartShell>
        </div>
      </section>

      <HeatmapPanel analytics={data} />

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Operational Metrics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.operational.metrics.map((metric) => {
              const progress = Math.min(100, (metric.value / metric.target) * 100);
              const color = metric.status === 'healthy' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={metric.label} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between gap-3"><p className="font-medium text-gray-900">{metric.label}</p><span className="text-sm font-semibold">{metric.value} {metric.unit}</span></div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100"><div className={cn('h-2 rounded-full', color)} style={{ width: `${progress}%` }} /></div>
                  <p className="mt-2 text-xs text-gray-400">Target: {metric.target} {metric.unit}</p>
                </div>
              );
            })}
          </div>
        </Card>
        <ActivityFeed events={liveEvents} />
      </section>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Export & Reporting System</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportReport('csv')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Export CSV</button>
          <button onClick={() => exportReport('pdf')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Export PDF</button>
          <button onClick={() => exportReport('revenue')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Generate Revenue Report</button>
          <button onClick={() => exportReport('drivers')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Generate Driver Report</button>
          <button onClick={() => exportReport('orders')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Generate Orders Report</button>
        </div>
      </Card>
    </div>
  );
};
