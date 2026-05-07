import React from 'react';
import { Notification } from '../../types';
import { Users, Send, Clock, AlertTriangle, CheckCircle, Info, XCircle, BarChart2, X } from 'lucide-react';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === 'SENT') return 'bg-green-50 text-green-700';
    if (status === 'SCHEDULED') return 'bg-blue-50 text-blue-700';
    if (status === 'FAILED') return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
        
        {/* Header Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-start">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-white p-2 rounded-lg shadow-sm">
              {getIcon(notification.type)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Created {new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${getStatusColor(notification.status)}`}>
            {notification.status || 'SENT'}
          </span>
        </div>

        {/* Message Content */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Message Content</h4>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
            {notification.message}
          </div>
        </div>

        {/* Audience & Delivery Config */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-brand-600)]" /> Target Audience
            </h4>
            <div className="flex flex-wrap gap-2">
              {notification.audience?.map((aud, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                  {aud.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--color-brand-600)]" /> Delivery Channels
            </h4>
            <div className="flex flex-wrap gap-2">
              {notification.channels?.map((ch, i) => (
                <span key={i} className="text-xs bg-[var(--color-brand-50)] text-[var(--color-brand-700)] px-2 py-1 rounded-md font-medium">
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduling Details */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Scheduled / Sent At</p>
              <p className="text-sm font-semibold text-gray-900">
                {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Priority</p>
            <p className="text-sm font-semibold text-gray-900">{notification.priority || 'MEDIUM'}</p>
          </div>
        </div>

        {/* Delivery Metrics */}
        {notification.stats && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[var(--color-brand-600)]" /> Delivery Metrics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{notification.stats.delivered.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Opened</p>
                <p className="text-2xl font-bold text-green-600">{notification.stats.opened.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{notification.stats.failed.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
