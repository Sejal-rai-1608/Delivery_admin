import React from 'react';
import { Card } from '../ui/Card';
import { Building2, Truck, Bell, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/companies')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-[var(--color-brand-50)] text-gray-600 hover:text-[var(--color-brand-600)] transition-colors border border-transparent hover:border-[var(--color-brand-100)]"
        >
          <Building2 className="w-6 h-6 mb-2" />
          <span className="text-xs font-medium">Add Company</span>
        </button>
        <button 
          onClick={() => navigate('/drivers')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-100"
        >
          <Truck className="w-6 h-6 mb-2" />
          <span className="text-xs font-medium">Add Driver</span>
        </button>
        <button 
          onClick={() => navigate('/notifications')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
        >
          <Bell className="w-6 h-6 mb-2" />
          <span className="text-xs font-medium">Send Alert</span>
        </button>
        <button 
          onClick={() => navigate('/analytics')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors border border-transparent hover:border-green-100"
        >
          <FileText className="w-6 h-6 mb-2" />
          <span className="text-xs font-medium">View Reports</span>
        </button>
      </div>
    </Card>
  );
};
