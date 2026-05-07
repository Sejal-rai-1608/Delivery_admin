import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CreateNotificationModal } from '../components/modals/CreateNotificationModal';
import { NotificationDetailModal } from '../components/modals/NotificationDetailModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import { 
  Bell, Info, AlertTriangle, CheckCircle, XCircle, 
  Search, Filter, Plus, RefreshCw, Eye, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => notificationService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsCreateOpen(false);
      toast.success('Notification created successfully');
    },
    onError: () => toast.error('Failed to create notification')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setDeleteModal({ isOpen: false, id: null });
      toast.success('Notification deleted');
    },
    onError: () => toast.error('Failed to delete notification')
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => notificationService.resendNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification resent successfully');
    },
    onError: () => toast.error('Failed to resend notification')
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'INFO': return <Info className="text-blue-500 w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
      case 'ERROR': return <XCircle className="text-red-500 w-5 h-5" />;
      case 'SUCCESS': return <CheckCircle className="text-green-500 w-5 h-5" />;
      default: return <Bell className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === 'SENT') return 'bg-green-50 text-green-700';
    if (status === 'SCHEDULED') return 'bg-blue-50 text-blue-700';
    if (status === 'FAILED') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            n.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-sm text-gray-500">Create, schedule, and track outbound alerts.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Notification
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="INFO">Information</option>
              <option value="WARNING">Warning</option>
              <option value="SUCCESS">Success</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none appearance-none text-sm bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm rounded-2xl">
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-medium text-gray-900">No notifications found</p>
              <p className="text-sm">Try adjusting your filters or create a new one.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-gray-50 group"
              >
                <div className="flex-1 flex gap-4">
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg shrink-0 h-fit">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getStatusColor(notif.status)}`}>
                        {notif.status || 'SENT'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      {notif.audience && (
                        <span>• Audience: {notif.audience.join(', ').replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <ActionDropdown 
                    actions={[
                      { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => setSelectedNotif(notif) },
                      { label: 'Resend', icon: <RefreshCw className="w-4 h-4" />, onClick: () => resendMutation.mutate(notif.id), color: 'default' },
                      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setDeleteModal({ isOpen: true, id: notif.id }), color: 'danger' },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <CreateNotificationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={(data) => createMutation.mutate(data)}
      />

      <NotificationDetailModal
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        notification={selectedNotif}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && deleteMutation.mutate(deleteModal.id)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification record from history? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
