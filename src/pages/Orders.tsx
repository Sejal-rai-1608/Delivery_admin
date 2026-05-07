import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../api/services/order.service';
import { driverService } from '../api/services/driver.service';
import { Order, OrderStatus } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { RejectReasonModal } from '../components/modals/RejectReasonModal';
import { ReassignDriverModal } from '../components/modals/ReassignDriverModal';
import { KPICard } from '../components/dashboard/KPICard';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { 
  Package, Search, Filter, ArrowUpDown, Eye, Truck, XCircle, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for Modals
  const [cancelModal, setCancelModal] = useState<{isOpen: boolean, orderId: string | null}>({ isOpen: false, orderId: null });
  const [reassignModal, setReassignModal] = useState<{isOpen: boolean, orderId: string | null}>({ isOpen: false, orderId: null });
  const [deliverModal, setDeliverModal] = useState<{isOpen: boolean, orderId: string | null}>({ isOpen: false, orderId: null });

  // State for Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  // Fetch Data
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: driverService.getDrivers
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: OrderStatus, reason?: string }) => 
      orderService.updateOrderStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancelModal({ isOpen: false, orderId: null });
      setDeliverModal({ isOpen: false, orderId: null });
    },
    onError: () => toast.error('Failed to update order status')
  });

  const reassignMutation = useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string, driverId: string }) => 
      orderService.reassignDriver(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setReassignModal({ isOpen: false, orderId: null });
      toast.success('Driver assigned successfully');
    },
    onError: () => toast.error('Failed to assign driver')
  });

  // Handlers
  const executeCancelAction = (reason: string) => {
    if (!cancelModal.orderId) return;
    updateStatusMutation.mutate(
      { id: cancelModal.orderId, status: 'CANCELLED', reason },
      { onSuccess: () => toast.success('Order cancelled successfully') }
    );
  };

  const executeReassignAction = (driverId: string) => {
    if (!reassignModal.orderId) return;
    reassignMutation.mutate({ orderId: reassignModal.orderId, driverId });
  };

  const executeMarkDelivered = () => {
    if (!deliverModal.orderId) return;
    updateStatusMutation.mutate(
      { id: deliverModal.orderId, status: 'DELIVERED' },
      { onSuccess: () => toast.success('Order marked as delivered') }
    );
  };

  // KPIs Data
  const kpis = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    inTransit: orders.filter(o => o.status === 'IN_TRANSIT').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    failed: 0 // Mock failed as 0 since it's not a primary status type in our mock data currently
  }), [orders]);

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const driverName = drivers.find(d => d.id === order.driverId)?.name || '';
        const matchesSearch = 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driverName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        const matchesPayment = paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;
        
        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, drivers, searchTerm, statusFilter, paymentFilter, sortBy]);

  // Table Columns
  const columns = [
    { 
      accessorKey: 'id', 
      header: 'Order ID',
      cell: (info: any) => (
        <button 
          onClick={() => navigate(`/orders/${info.getValue()}`)}
          className="font-mono text-[var(--color-brand-600)] hover:underline"
        >
          {info.getValue()}
        </button>
      )
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Date & Time',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    { accessorKey: 'customerName', header: 'Customer' },
    { 
      accessorKey: 'driverId', 
      header: 'Driver',
      cell: (info: any) => {
        const driverId = info.getValue();
        if (!driverId) return <span className="text-gray-400 italic">Unassigned</span>;
        const driver = drivers.find(d => d.id === driverId);
        return driver ? driver.name : driverId;
      }
    },
    { 
      accessorKey: 'pickupAddress', 
      header: 'Pickup',
      cell: (info: any) => <span className="truncate max-w-[120px] block" title={info.getValue()}>{info.getValue()}</span>
    },
    { 
      accessorKey: 'dropAddress', 
      header: 'Dropoff',
      cell: (info: any) => <span className="truncate max-w-[120px] block" title={info.getValue()}>{info.getValue()}</span>
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} type="order" />
    },
    { 
      accessorKey: 'price', 
      header: 'Price',
      cell: (info: any) => <span className="font-medium">${info.getValue().toFixed(2)}</span>
    },
    { 
      accessorKey: 'paymentStatus', 
      header: 'Payment',
      cell: (info: any) => {
        const status = info.getValue() || 'PENDING';
        return (
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
            status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {status}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => {
        const order = info.row.original as Order;
        const canReassign = ['PENDING'].includes(order.status);
        const canMarkDelivered = order.status === 'IN_TRANSIT';
        
        return (
          <ActionDropdown 
            actions={[
              { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => navigate(`/orders/${order.id}`) },
              { label: order.driverId ? 'Reassign Driver' : 'Assign Driver', icon: <Truck className="w-4 h-4" />, onClick: () => setReassignModal({ isOpen: true, orderId: order.id }), color: 'default', hidden: !canReassign },
              { label: 'Cancel Order', icon: <XCircle className="w-4 h-4" />, onClick: () => setCancelModal({ isOpen: true, orderId: order.id }), color: 'danger', hidden: ['DELIVERED', 'CANCELLED'].includes(order.status) },
              { label: 'Mark Delivered', icon: <CheckCircle className="w-4 h-4" />, onClick: () => setDeliverModal({ isOpen: true, orderId: order.id }), color: 'success', hidden: !canMarkDelivered },
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Track and manage deliveries</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <KPICard title="Total Orders" value={kpis.total} icon={Package} colorScheme="blue" onClick={() => setStatusFilter('ALL')} />
        <KPICard title="Pending" value={kpis.pending} icon={Package} colorScheme="orange" onClick={() => setStatusFilter('PENDING')} />
        <KPICard title="In Transit" value={kpis.inTransit} icon={Truck} colorScheme="orange" onClick={() => setStatusFilter('IN_TRANSIT')} />
        <KPICard title="Delivered" value={kpis.delivered} icon={CheckCircle} colorScheme="green" onClick={() => setStatusFilter('DELIVERED')} />
        <KPICard title="Cancelled" value={kpis.cancelled} icon={XCircle} colorScheme="red" onClick={() => setStatusFilter('CANCELLED')} />
        <KPICard title="Failed" value={kpis.failed} icon={XCircle} colorScheme="purple" onClick={() => setPaymentFilter('FAILED')} />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Order ID, Customer, Driver..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="ALL">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 && !ordersLoading ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No orders found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredOrders} 
            isLoading={ordersLoading}
            onRowClick={(row) => navigate(`/orders/${row.id}`)}
          />
        )}
      </div>

      {/* Modals */}
      <RejectReasonModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        onConfirm={executeCancelAction}
        title="Cancel Order"
      />

      <ReassignDriverModal
        isOpen={reassignModal.isOpen}
        onClose={() => setReassignModal({ isOpen: false, orderId: null })}
        onConfirm={executeReassignAction}
        drivers={drivers}
      />

      <ConfirmModal
        isOpen={deliverModal.isOpen}
        onCancel={() => setDeliverModal({ isOpen: false, orderId: null })}
        onConfirm={executeMarkDelivered}
        title="Mark Order as Delivered"
        message="Are you sure you want to manually mark this order as delivered? This action cannot be undone."
        confirmLabel="Mark Delivered"
        variant="primary"
      />
    </div>
  );
};
