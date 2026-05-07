import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Filter,
  RefreshCcw,
  Search,
  Server,
  ShieldAlert,
  SlidersHorizontal,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auditService } from '../api/services/audit.service';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/tables/DataTable';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { useAuditLogStore } from '../store/auditLogStore';
import {
  AuditActionType,
  AuditActorRole,
  AuditChangeSet,
  AuditLog,
  AuditResourceType,
  AuditSeverity,
  AuditStatus,
} from '../types';
import { cn } from '../utils/cn';

type DateRangeFilter = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM';
type QuickFilter = 'ALL' | 'CRITICAL' | 'FAILED' | 'SUSPENDED' | 'SYSTEM';

interface AuditFilters {
  action: AuditActionType | 'ALL';
  severity: AuditSeverity | 'ALL';
  status: AuditStatus | 'ALL';
  resourceType: AuditResourceType | 'ALL';
  dateRange: DateRangeFilter;
  actorRole: AuditActorRole | 'ALL';
}

const actionOptions: AuditActionType[] = [
  'Company Approved',
  'Company Rejected',
  'Driver Suspended',
  'Driver Approved',
  'Order Assigned',
  'Order Cancelled',
  'Notification Sent',
  'Settings Updated',
  'Login',
  'Logout',
];

const severityOptions: AuditSeverity[] = ['Info', 'Warning', 'Critical'];
const statusOptions: AuditStatus[] = ['Success', 'Failed'];
const resourceOptions: AuditResourceType[] = ['Company', 'Driver', 'Order', 'Settings', 'Notification'];
const actorOptions: AuditActorRole[] = ['Super Admin', 'Manager', 'System'];
const pageSizeOptions = [10, 25, 50];

const defaultFilters: AuditFilters = {
  action: 'ALL',
  severity: 'ALL',
  status: 'ALL',
  resourceType: 'ALL',
  dateRange: 'LAST_30_DAYS',
  actorRole: 'ALL',
};

const severityStyles: Record<AuditSeverity, string> = {
  Info: 'bg-blue-50 text-blue-700 border-blue-100',
  Warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Critical: 'bg-red-50 text-red-700 border-red-100',
};

const statusStyles: Record<AuditStatus, string> = {
  Success: 'bg-green-50 text-green-700 border-green-100',
  Failed: 'bg-red-50 text-red-700 border-red-100',
};

const formatDateTime = (timestamp: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));

const normalize = (value: unknown) => String(value ?? '').toLowerCase();

const getSearchHaystack = (log: AuditLog) =>
  [
    log.id,
    log.actor,
    log.actorRole,
    log.action,
    log.resourceType,
    log.resourceId,
    log.resourceName,
    log.details,
    log.resourceIds?.companyId,
    log.resourceIds?.driverId,
    log.resourceIds?.orderId,
    log.resourceIds?.notificationId,
    ...Object.values(log.before),
    ...Object.values(log.after),
    ...(log.searchTags || []),
  ]
    .map(normalize)
    .join(' ');

const isWithinDateRange = (
  timestamp: string,
  dateRange: DateRangeFilter,
  customStartDate: string,
  customEndDate: string
) => {
  const logDate = new Date(timestamp);
  const now = new Date();

  if (dateRange === 'TODAY') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return logDate >= start && logDate <= now;
  }

  if (dateRange === 'LAST_7_DAYS' || dateRange === 'LAST_30_DAYS') {
    const days = dateRange === 'LAST_7_DAYS' ? 7 : 30;
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    return logDate >= start && logDate <= now;
  }

  const start = customStartDate ? new Date(`${customStartDate}T00:00:00`) : null;
  const end = customEndDate ? new Date(`${customEndDate}T23:59:59`) : null;
  return (!start || logDate >= start) && (!end || logDate <= end);
};

const matchesQuickFilter = (log: AuditLog, quickFilter: QuickFilter) => {
  if (quickFilter === 'CRITICAL') return log.severity === 'Critical';
  if (quickFilter === 'FAILED') return log.status === 'Failed';
  if (quickFilter === 'SUSPENDED') return log.action.includes('Suspended');
  if (quickFilter === 'SYSTEM') return log.actorRole === 'System' || log.resourceType === 'System';
  return true;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Badge: React.FC<{ label: string; className: string }> = ({ label, className }) => (
  <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', className)}>
    {label}
  </span>
);

const AuditKpiCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'red' | 'orange' | 'purple' | 'green';
  active: boolean;
  onClick: () => void;
}> = ({ title, value, icon: Icon, color, active, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick();
      }}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        active ? 'border-[var(--color-brand-500)] ring-2 ring-[var(--color-brand-100)]' : ''
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};

const ChangeBlock: React.FC<{ title: string; data: AuditChangeSet }> = ({ title, data }) => {
  const entries = Object.entries(data);

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</p>
      <div className="min-h-[112px] rounded-xl border border-gray-100 bg-gray-950 p-4 font-mono text-xs text-gray-100">
        {entries.length === 0 ? (
          <p className="text-gray-400">No captured changes</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-2">
                <span className="text-purple-200">{key}</span>
                <span className="text-gray-500">=</span>
                <span className="break-all text-green-200">{String(value ?? 'null')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-1 break-all text-sm font-semibold text-gray-900">{value || '-'}</p>
  </div>
);

const AuditLogDetailDrawer: React.FC<{
  log: AuditLog | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCopyLogId: (id: string) => void;
}> = ({ log, isOpen, isLoading, onClose, onCopyLogId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <button className="hidden flex-1 lg:block" aria-label="Close audit log details" onClick={onClose} />
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">Audit Trail</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{log?.action || 'Loading log details'}</h2>
            {isLoading && <p className="mt-1 text-xs text-gray-400">Refreshing full log record...</p>}
          </div>
          <div className="flex items-center gap-2">
            {log && (
              <button
                onClick={() => onCopyLogId(log.id)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[var(--color-brand-600)]"
                title="Copy Log ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {log ? (
          <div className="space-y-6 p-5">
            <section>
              <h3 className="mb-3 text-sm font-bold text-gray-900">General Info</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Log ID" value={log.id} />
                <DetailRow label="Timestamp" value={formatDateTime(log.timestamp)} />
                <DetailRow label="Actor" value={`${log.actor} (${log.actorRole})`} />
                <DetailRow label="Action" value={log.action} />
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Severity</p>
                  <div className="mt-2"><Badge label={log.severity} className={severityStyles[log.severity]} /></div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</p>
                  <div className="mt-2"><Badge label={log.status} className={statusStyles[log.status]} /></div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold text-gray-900">Resource Info</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Company ID" value={log.resourceIds?.companyId} />
                <DetailRow label="Driver ID" value={log.resourceIds?.driverId} />
                <DetailRow label="Order ID" value={log.resourceIds?.orderId} />
                <DetailRow label="Notification ID" value={log.resourceIds?.notificationId} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold text-gray-900">Before / After Changes</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChangeBlock title="Before" data={log.before} />
                <ChangeBlock title="After" data={log.after} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold text-gray-900">Metadata</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="Browser" value={log.metadata.browser} />
                <DetailRow label="Device" value={log.metadata.device} />
                <DetailRow label="IP Address" value={log.metadata.ipAddress} />
                <DetailRow label="Session ID" value={log.metadata.sessionId} />
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export const AuditLogs: React.FC = () => {
  const logs = useAuditLogStore((state) => state.logs);
  const setLogs = useAuditLogStore((state) => state.setLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AuditFilters>(defaultFilters);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { data: fetchedLogs, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: auditService.getAuditLogs,
  });

  useEffect(() => {
    if (fetchedLogs) setLogs(fetchedLogs);
  }, [fetchedLogs, setLogs]);

  const kpis = useMemo(() => ({
    total: logs.length,
    critical: logs.filter((log) => log.severity === 'Critical').length,
    failed: logs.filter((log) => log.status === 'Failed').length,
    suspended: logs.filter((log) => log.action.includes('Suspended')).length,
    system: logs.filter((log) => log.actorRole === 'System' || log.resourceType === 'System').length,
  }), [logs]);

  const filteredLogs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch = !search || getSearchHaystack(log).includes(search);
      const matchesAction = filters.action === 'ALL' || log.action === filters.action;
      const matchesSeverity = filters.severity === 'ALL' || log.severity === filters.severity;
      const matchesStatus = filters.status === 'ALL' || log.status === filters.status;
      const matchesResource = filters.resourceType === 'ALL' || log.resourceType === filters.resourceType;
      const matchesActor = filters.actorRole === 'ALL' || log.actorRole === filters.actorRole;
      const matchesDate = isWithinDateRange(log.timestamp, filters.dateRange, customStartDate, customEndDate);
      return matchesSearch && matchesAction && matchesSeverity && matchesStatus && matchesResource && matchesActor && matchesDate && matchesQuickFilter(log, quickFilter);
    });
  }, [customEndDate, customStartDate, filters, logs, quickFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const showingStart = filteredLogs.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, filteredLogs.length);

  useEffect(() => {
    setPage(1);
  }, [customEndDate, customStartDate, filters, pageSize, quickFilter, searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateFilter = <TKey extends keyof AuditFilters>(key: TKey, value: AuditFilters[TKey]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters(defaultFilters);
    setQuickFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.error) {
      toast.error('Failed to refresh audit logs');
      return;
    }
    toast.success('Audit logs refreshed');
  };

  const handleExport = async () => {
    if (filteredLogs.length === 0) return;

    try {
      const blob = await auditService.exportAuditLogs(filteredLogs, 'csv');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredLogs.length} filtered logs`);
    } catch {
      toast.error('Failed to export audit logs');
    }
  };

  const handleOpenDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    auditService
      .getAuditLogById(log.id)
      .then(setSelectedLog)
      .catch(() => toast.error('Unable to load full audit detail'))
      .finally(() => setIsDetailLoading(false));
  };

  const handleCopyLogId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Log ID copied');
    } catch {
      toast.error('Unable to copy Log ID');
    }
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{formatDateTime(row.original.timestamp)}</p>
          <p className="font-mono text-xs text-gray-400">{row.original.id}</p>
        </div>
      ),
    },
    {
      accessorKey: 'actor',
      header: 'Actor/User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
            {row.original.actorRole === 'System' ? 'SY' : getInitials(row.original.actor)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.actor}</p>
            <p className="text-xs text-gray-500">{row.original.actorRole}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.action}</span>,
    },
    {
      accessorKey: 'resourceId',
      header: 'Resource',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.resourceName || row.original.resourceType}</p>
          <p className="font-mono text-xs text-gray-400">{row.original.resourceId}</p>
        </div>
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity Badge',
      cell: ({ row }) => <Badge label={row.original.severity} className={severityStyles[row.original.severity]} />,
    },
    {
      accessorKey: 'status',
      header: 'Status Badge',
      cell: ({ row }) => <Badge label={row.original.status} className={statusStyles[row.original.status]} />,
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => (
        <span className="block max-w-[280px] truncate text-gray-600" title={row.original.details}>
          {row.original.details}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => handleOpenDetails(row.original) },
            { label: 'Copy Log ID', icon: <Copy className="h-4 w-4" />, onClick: () => handleCopyLogId(row.original.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShieldAlert className="text-[var(--color-brand-600)]" /> Audit Logs
          </h1>
          <p className="text-sm text-gray-500">Track all administrative actions and system changes.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-70"
          >
            <RefreshCcw className={cn('h-4 w-4', isFetching ? 'animate-spin' : '')} />
            Refresh Logs
          </button>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AuditKpiCard title="Total Logs" value={kpis.total} icon={ShieldAlert} color="blue" active={quickFilter === 'ALL'} onClick={() => setQuickFilter('ALL')} />
        <AuditKpiCard title="Critical Actions" value={kpis.critical} icon={AlertTriangle} color="red" active={quickFilter === 'CRITICAL'} onClick={() => setQuickFilter('CRITICAL')} />
        <AuditKpiCard title="Failed Actions" value={kpis.failed} icon={XCircle} color="red" active={quickFilter === 'FAILED'} onClick={() => setQuickFilter('FAILED')} />
        <AuditKpiCard title="Suspended Accounts" value={kpis.suspended} icon={Ban} color="orange" active={quickFilter === 'SUSPENDED'} onClick={() => setQuickFilter('SUSPENDED')} />
        <AuditKpiCard title="System Events" value={kpis.system} icon={Server} color="purple" active={quickFilter === 'SYSTEM'} onClick={() => setQuickFilter('SYSTEM')} />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search actor, action, company, driver, order ID, or resource ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-brand-500)]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowMobileFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className={cn('grid grid-cols-1 gap-3 md:grid md:grid-cols-2 xl:grid-cols-6', showMobileFilters ? 'grid' : 'hidden')}>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.action}
              onChange={(event) => updateFilter('action', event.target.value as AuditFilters['action'])}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            >
              <option value="ALL">All Actions</option>
              {actionOptions.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
          </div>

          <select
            value={filters.severity}
            onChange={(event) => updateFilter('severity', event.target.value as AuditFilters['severity'])}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          >
            <option value="ALL">All Severity</option>
            {severityOptions.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value as AuditFilters['status'])}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          >
            <option value="ALL">All Status</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <select
            value={filters.resourceType}
            onChange={(event) => updateFilter('resourceType', event.target.value as AuditFilters['resourceType'])}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          >
            <option value="ALL">All Resources</option>
            {resourceOptions.map((resource) => <option key={resource} value={resource}>{resource}</option>)}
          </select>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.dateRange}
              onChange={(event) => updateFilter('dateRange', event.target.value as DateRangeFilter)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            >
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          <select
            value={filters.actorRole}
            onChange={(event) => updateFilter('actorRole', event.target.value as AuditFilters['actorRole'])}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          >
            <option value="ALL">All Actors</option>
            {actorOptions.map((actor) => <option key={actor} value={actor}>{actor}</option>)}
          </select>
        </div>

        {filters.dateRange === 'CUSTOM' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => setCustomStartDate(event.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => setCustomEndDate(event.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            />
          </div>
        )}
      </Card>

      <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
        <DataTable
          columns={columns}
          data={paginatedLogs}
          isLoading={isLoading}
          stickyHeader
          minWidth={1180}
          emptyIcon={<ShieldAlert className="h-12 w-12 text-gray-300" />}
          emptyTitle="No audit logs found"
          emptyDescription="Try adjusting your search, KPI, date range, or advanced filters."
        />
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing <span className="font-medium text-gray-900">{showingStart}</span> to{' '}
            <span className="font-medium text-gray-900">{showingEnd}</span> of{' '}
            <span className="font-medium text-gray-900">{filteredLogs.length}</span> filtered logs
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            >
              {pageSizeOptions.map((size) => <option key={size} value={size}>{size} / page</option>)}
            </select>
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[76px] text-center text-sm font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      <AuditLogDetailDrawer
        log={selectedLog}
        isOpen={isDetailOpen}
        isLoading={isDetailLoading}
        onClose={() => setIsDetailOpen(false)}
        onCopyLogId={handleCopyLogId}
      />
    </div>
  );
};
