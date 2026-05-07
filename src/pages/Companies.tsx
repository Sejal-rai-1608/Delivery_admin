import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../api/services/company.service';
import { Company, CompanyStatus } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { RejectReasonModal } from '../components/modals/RejectReasonModal';
import { KPICard } from '../components/dashboard/KPICard';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { 
  Building2, CheckCircle, XCircle, Ban, 
  RefreshCcw, Eye, Search, Filter, ArrowUpDown 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for Modals
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, companyId: string | null, action: 'approve' | 'suspend' | 'reactivate' | null}>({
    isOpen: false, companyId: null, action: null
  });
  
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, companyId: string | null}>({
    isOpen: false, companyId: null
  });

  // State for Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'orders'>('date');

  // Fetch Data
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: CompanyStatus, reason?: string }) => 
      companyService.updateCompanyStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setConfirmModal({ isOpen: false, companyId: null, action: null });
      setRejectModal({ isOpen: false, companyId: null });
    },
    onError: () => toast.error('Failed to update company status')
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => companyService.reactivateCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setConfirmModal({ isOpen: false, companyId: null, action: null });
      toast.success('Company reactivated successfully');
    },
    onError: () => toast.error('Failed to reactivate company')
  });

  // Handlers
  const executeConfirmAction = () => {
    if (!confirmModal.companyId || !confirmModal.action) return;
    
    if (confirmModal.action === 'approve') {
      updateStatusMutation.mutate(
        { id: confirmModal.companyId, status: 'APPROVED' },
        { onSuccess: () => toast.success('Company approved successfully') }
      );
    } else if (confirmModal.action === 'suspend') {
      updateStatusMutation.mutate(
        { id: confirmModal.companyId, status: 'SUSPENDED' },
        { onSuccess: () => toast.success('Company suspended successfully') }
      );
    } else if (confirmModal.action === 'reactivate') {
      reactivateMutation.mutate(confirmModal.companyId);
    }
  };

  const executeRejectAction = (reason: string) => {
    if (!rejectModal.companyId) return;
    updateStatusMutation.mutate(
      { id: rejectModal.companyId, status: 'REJECTED', reason },
      { onSuccess: () => toast.success('Company rejected successfully') }
    );
  };

  // KPIs Data
  const kpis = useMemo(() => ({
    total: companies.length,
    active: companies.filter(c => c.status === 'APPROVED').length,
    pending: companies.filter(c => c.status === 'PENDING').length,
    suspended: companies.filter(c => c.status === 'SUSPENDED').length
  }), [companies]);

  // Filter & Sort Logic
  const filteredCompanies = useMemo(() => {
    return companies
      .filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              company.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'revenue') return (b.metrics?.revenue || 0) - (a.metrics?.revenue || 0);
        if (sortBy === 'orders') return (b.metrics?.totalOrders || 0) - (a.metrics?.totalOrders || 0);
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      });
  }, [companies, searchTerm, statusFilter, sortBy]);

  // Table Columns
  const columns = [
    { 
      accessorKey: 'name', 
      header: 'Company',
      cell: (info: any) => {
        const company = info.row.original as Company;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{company.name}</p>
              <p className="text-xs text-gray-500">{company.id}</p>
            </div>
          </div>
        );
      }
    },
    { accessorKey: 'contactPerson', header: 'Contact' },
    { 
      accessorKey: 'contact', 
      header: 'Contact Details',
      cell: (info: any) => {
        const c = info.row.original as Company;
        return (
          <div className="text-sm">
            <p className="text-gray-900">{c.email}</p>
            <p className="text-gray-500 text-xs">{c.phone}</p>
          </div>
        );
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} type="company" />
    },
    { 
      accessorKey: 'metrics.activeDrivers', 
      header: 'Drivers',
      cell: (info: any) => info.getValue() || 0
    },
    { 
      accessorKey: 'metrics.totalOrders', 
      header: 'Orders',
      cell: (info: any) => info.getValue() || 0
    },
    { 
      accessorKey: 'metrics.revenue', 
      header: 'Revenue',
      cell: (info: any) => {
        const val = info.getValue() || 0;
        return `$${val.toLocaleString()}`;
      }
    },
    { 
      accessorKey: 'registrationDate', 
      header: 'Joined Date',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => {
        const company = info.row.original as Company;
        
        return (
          <ActionDropdown 
            actions={[
              { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => navigate(`/companies/${company.id}`) },
              { label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, companyId: company.id, action: 'approve' }), color: 'success', hidden: company.status !== 'PENDING' },
              { label: 'Reject', icon: <XCircle className="w-4 h-4" />, onClick: () => setRejectModal({ isOpen: true, companyId: company.id }), color: 'danger', hidden: company.status !== 'PENDING' },
              { label: 'Suspend', icon: <Ban className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, companyId: company.id, action: 'suspend' }), color: 'warning', hidden: company.status !== 'APPROVED' },
              { label: 'Reactivate', icon: <RefreshCcw className="w-4 h-4" />, onClick: () => setConfirmModal({ isOpen: true, companyId: company.id, action: 'reactivate' }), color: 'success', hidden: company.status !== 'SUSPENDED' },
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
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-sm text-gray-500">Manage all registered transport companies, verifications, and performance.</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Companies" value={kpis.total} icon={Building2} colorScheme="blue" onClick={() => setStatusFilter('ALL')} />
        <KPICard title="Active Companies" value={kpis.active} icon={CheckCircle} colorScheme="green" onClick={() => setStatusFilter('APPROVED')} />
        <KPICard title="Pending Approvals" value={kpis.pending} icon={Building2} colorScheme="purple" onClick={() => setStatusFilter('PENDING')} />
        <KPICard title="Suspended" value={kpis.suspended} icon={Ban} colorScheme="red" onClick={() => setStatusFilter('SUSPENDED')} />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by company name or ID..." 
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
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
              <option value="revenue">Sort by Revenue</option>
              <option value="orders">Sort by Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredCompanies.length === 0 && !isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No companies found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredCompanies} 
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/companies/${row.id}`)}
          />
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onCancel={() => setConfirmModal({ isOpen: false, companyId: null, action: null })}
        onConfirm={executeConfirmAction}
        title={confirmModal.action === 'approve' ? 'Approve Company' : confirmModal.action === 'suspend' ? 'Suspend Company' : 'Reactivate Company'}
        message={`Are you sure you want to ${confirmModal.action} this company?`}
        confirmLabel={confirmModal.action === 'approve' ? 'Approve' : confirmModal.action === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirmModal.action === 'suspend' ? 'danger' : 'primary'}
      />

      <RejectReasonModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, companyId: null })}
        onConfirm={executeRejectAction}
        title="Reject Company"
      />
    </div>
  );
};
