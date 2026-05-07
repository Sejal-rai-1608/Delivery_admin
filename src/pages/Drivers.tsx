import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../api/services/driver.service';
import { Driver, DriverStatus } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { RejectReasonModal } from '../components/modals/RejectReasonModal';
import { KPICard } from '../components/dashboard/KPICard';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { 
  Users, CheckCircle, XCircle, Ban, 
  RefreshCcw, Eye, Search, Filter, ArrowUpDown, Star 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Drivers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for Modals
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, driverId: string | null, action: 'approve' | 'suspend' | 'reactivate' | null}>({
    isOpen: false, driverId: null, action: null
  });
  
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, driverId: string | null}>({
    isOpen: false, driverId: null
  });

  // State for Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'ONLINE' | 'ON_DELIVERY' | 'OFFLINE' | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'earnings' | 'date'>('date');

  // Fetch Data
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: driverService.getDrivers
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: DriverStatus, reason?: string }) => 
      driverService.updateDriverStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setConfirmModal({ isOpen: false, driverId: null, action: null });
      setRejectModal({ isOpen: false, driverId: null });
    },
    onError: () => toast.error('Failed to update driver status')
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => driverService.reactivateDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setConfirmModal({ isOpen: false, driverId: null, action: null });
      toast.success('Driver reactivated successfully');
    },
    onError: () => toast.error('Failed to reactivate driver')
  });

  // Handlers
  const executeConfirmAction = () => {
    if (!confirmModal.driverId || !confirmModal.action) return;
    
    if (confirmModal.action === 'approve') {
      updateStatusMutation.mutate(
        { id: confirmModal.driverId, status: 'APPROVED' },
        { onSuccess: () => toast.success('Driver approved successfully') }
      );
    } else if (confirmModal.action === 'suspend') {
      updateStatusMutation.mutate(
        { id: confirmModal.driverId, status: 'SUSPENDED' },
        { onSuccess: () => toast.success('Driver suspended successfully') }
      );
    } else if (confirmModal.action === 'reactivate') {
      reactivateMutation.mutate(confirmModal.driverId);
    }
  };

  const executeRejectAction = (reason: string) => {
    if (!rejectModal.driverId) return;
    updateStatusMutation.mutate(
      { id: rejectModal.driverId, status: 'REJECTED', reason },
      { onSuccess: () => toast.success('Driver rejected successfully') }
    );
  };

  // Mocking Live Status for UI filtering demo
  // In a real app, 'online' status comes from a socket stream
  const driversWithLiveStatus = useMemo(() => {
    return drivers.map(d => ({
      ...d,
      liveStatus: d.status === 'APPROVED' ? (Math.random() > 0.5 ? 'ONLINE' : (Math.random() > 0.5 ? 'ON_DELIVERY' : 'OFFLINE')) : d.status
    }));
  }, [drivers]);

  // KPIs Data
  const kpis = useMemo(() => ({
    total: drivers.length,
    online: driversWithLiveStatus.filter(d => d.liveStatus === 'ONLINE').length,
    onDelivery: driversWithLiveStatus.filter(d => d.liveStatus === 'ON_DELIVERY').length,
    suspended: drivers.filter(d => d.status === 'SUSPENDED').length,
    pending: drivers.filter(d => d.status === 'PENDING').length
  }), [drivers, driversWithLiveStatus]);

  // Filter & Sort Logic
  const filteredDrivers = useMemo(() => {
    return driversWithLiveStatus
      .filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              driver.phone.includes(searchTerm) ||
                              driver.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || driver.liveStatus === statusFilter || driver.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'earnings') return (b.earnings || 0) - (a.earnings || 0);
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      });
  }, [driversWithLiveStatus, searchTerm, statusFilter, sortBy]);

  // Table Columns
  const columns = [
    { 
      accessorKey: 'name', 
      header: 'Driver',
      cell: (info: any) => {
        const driver = info.row.original as Driver;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden shrink-0">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} alt={driver.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{driver.name}</p>
              <p className="text-xs text-gray-500">{driver.phone}</p>
            </div>
          </div>
        );
      }
    },
    { accessorKey: 'companyId', header: 'Company' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const d = info.row.original;
        // In reality, you'd use a dedicated liveStatus component. 
        // We'll use the driver status badge, but you could enhance it to show online/offline dots
        return <StatusBadge status={d.liveStatus as any || d.status} type="driver" />
      }
    },
    { 
      accessorKey: 'rating', 
      header: 'Rating',
      cell: (info: any) => (
        <div className="flex items-center gap-1 text-yellow-500 font-medium text-sm">
          <Star className="w-4 h-4 fill-current" />
          {info.getValue() || '0.0'}
        </div>
      )
    },
    { 
      accessorKey: 'deliveries', 
      header: 'Deliveries',
      cell: (info: any) => info.getValue() || 0
    },
    { 
      accessorKey: 'earnings', 
      header: 'Earnings',
      cell: (info: any) => {
        const val = info.getValue() || 0;
        return `$${val.toLocaleString()}`;
      }
    },
    { accessorKey: 'vehicleType', header: 'Vehicle', cell: (info: any) => <span className="capitalize">{info.getValue()}</span> },
    { 
      accessorKey: 'joinedDate', 
      header: 'Joined Date',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => {
        const driver = info.row.original as Driver;
        
        return (
          <ActionDropdown 
            actions={[
              { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => navigate(`/drivers/${driver.id}`) },
              { label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, driverId: driver.id, action: 'approve' }), color: 'success', hidden: driver.status !== 'PENDING' },
              { label: 'Reject', icon: <XCircle className="w-4 h-4" />, onClick: () => setRejectModal({ isOpen: true, driverId: driver.id }), color: 'danger', hidden: driver.status !== 'PENDING' },
              { label: 'Suspend', icon: <Ban className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, driverId: driver.id, action: 'suspend' }), color: 'warning', hidden: driver.status !== 'APPROVED' },
              { label: 'Reactivate', icon: <RefreshCcw className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, driverId: driver.id, action: 'reactivate' }), color: 'success', hidden: driver.status !== 'SUSPENDED' },
            ]}
          />
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500">Monitor driver performance, verify documents, and track locations.</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Drivers" value={kpis.total} icon={Users} colorScheme="blue" onClick={() => setStatusFilter('ALL')} />
        <KPICard title="Online" value={kpis.online} icon={CheckCircle} colorScheme="green" onClick={() => setStatusFilter('ONLINE')} />
        <KPICard title="On Delivery" value={kpis.onDelivery} icon={CheckCircle} colorScheme="orange" onClick={() => setStatusFilter('ON_DELIVERY')} />
        <KPICard title="Pending" value={kpis.pending} icon={Users} colorScheme="purple" onClick={() => setStatusFilter('PENDING')} />
        <KPICard title="Suspended" value={kpis.suspended} icon={Ban} colorScheme="red" onClick={() => setStatusFilter('SUSPENDED')} />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="ONLINE">Online</option>
              <option value="ON_DELIVERY">On Delivery</option>
              <option value="OFFLINE">Offline</option>
              <option value="PENDING">Pending Approval</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
              <option value="earnings">Sort by Earnings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredDrivers.length === 0 && !isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No drivers found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredDrivers} 
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/drivers/${row.id}`)}
          />
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onCancel={() => setConfirmModal({ isOpen: false, driverId: null, action: null })}
        onConfirm={executeConfirmAction}
        title={confirmModal.action === 'approve' ? 'Approve Driver' : confirmModal.action === 'suspend' ? 'Suspend Driver' : 'Reactivate Driver'}
        message={`Are you sure you want to ${confirmModal.action} this driver?`}
        confirmLabel={confirmModal.action === 'approve' ? 'Approve' : confirmModal.action === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmModal.action === 'suspend' ? 'danger' : 'primary'}
      />

      <RejectReasonModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, driverId: null })}
        onConfirm={executeRejectAction}
        title="Reject Driver"
      />
    </div>
  );
};
