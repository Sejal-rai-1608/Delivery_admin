import React, { useState } from 'react';
import { Bell, Clock, Users, Send, X } from 'lucide-react';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    audience: ['ALL_USERS'],
    channels: ['PUSH'],
    priority: 'MEDIUM',
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAudienceChange = (value: string) => {
    setFormData(prev => {
      const isSelected = prev.audience.includes(value);
      if (isSelected) return { ...prev, audience: prev.audience.filter(a => a !== value) };
      return { ...prev, audience: [...prev.audience, value] };
    });
  };

  const handleChannelChange = (value: string) => {
    setFormData(prev => {
      const isSelected = prev.channels.includes(value);
      if (isSelected) return { ...prev, channels: prev.channels.filter(c => c !== value) };
      return { ...prev, channels: [...prev.channels, value] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct payload
    const payload = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      audience: formData.audience,
      channels: formData.channels,
      priority: formData.priority,
      status: formData.scheduleType === 'now' ? 'SENT' : 'SCHEDULED',
      sentAt: formData.scheduleType === 'now' ? new Date().toISOString() : new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString(),
    };
    
    onConfirm(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create Notification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none"
              placeholder="e.g., Holiday Bonus Structure"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none bg-white"
            >
              <option value="INFO">Information</option>
              <option value="SUCCESS">Success / Promo</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Critical Alert</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            required
            rows={3}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)] outline-none resize-none"
            placeholder="Enter the notification message..."
          ></textarea>
        </div>

        {/* Audience & Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-brand-600)]" /> Target Audience
            </label>
            <div className="space-y-2">
              {['ALL_USERS', 'ALL_DRIVERS', 'ALL_COMPANIES'].map(aud => (
                <label key={aud} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.audience.includes(aud)}
                    onChange={() => handleAudienceChange(aud)}
                    className="rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]"
                  />
                  {aud.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--color-brand-600)]" /> Delivery Channels
            </label>
            <div className="space-y-2">
              {['PUSH', 'EMAIL', 'SMS'].map(channel => (
                <label key={channel} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.channels.includes(channel)}
                    onChange={() => handleChannelChange(channel)}
                    className="rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]"
                  />
                  {channel} Notification
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> Delivery Schedule
            </label>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="schedule" checked={formData.scheduleType === 'now'} onChange={() => handleChange('scheduleType', 'now')} /> Send Now
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="schedule" checked={formData.scheduleType === 'later'} onChange={() => handleChange('scheduleType', 'later')} /> Schedule Later
              </label>
            </div>
            {formData.scheduleType === 'later' && (
              <div className="flex gap-2">
                <input type="date" required={formData.scheduleType === 'later'} value={formData.scheduledDate} onChange={(e) => handleChange('scheduledDate', e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
                <input type="time" required={formData.scheduleType === 'later'} value={formData.scheduledTime} onChange={(e) => handleChange('scheduledTime', e.target.value)} className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <div className="flex gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map(prio => (
                <button 
                  key={prio} type="button"
                  onClick={() => handleChange('priority', prio)}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    formData.priority === prio 
                      ? prio === 'HIGH' ? 'bg-red-50 border-red-200 text-red-700' : 
                        prio === 'MEDIUM' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={formData.audience.length === 0 || formData.channels.length === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> {formData.scheduleType === 'now' ? 'Send Notification' : 'Schedule Notification'}
          </button>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};
