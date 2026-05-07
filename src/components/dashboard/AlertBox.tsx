import React from 'react';
import { Card } from '../ui/Card';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertBoxProps {
  alerts: {
    pendingCompanies: number;
    pendingDrivers: number;
    failedOrders: number;
  };
}

export const AlertBox: React.FC<AlertBoxProps> = ({ alerts }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-red-50 border-red-100">
      <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" /> Action Required
      </h3>
      <div className="space-y-2">
        {alerts.pendingCompanies > 0 && (
          <button 
            onClick={() => navigate('/companies')}
            className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow text-left transition-all border border-red-100"
          >
            <div>
              <p className="text-sm font-semibold text-red-700">{alerts.pendingCompanies} Pending Companies</p>
              <p className="text-xs text-gray-500 mt-0.5">Awaiting verification</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}
        
        {alerts.pendingDrivers > 0 && (
          <button 
            onClick={() => navigate('/drivers')}
            className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow text-left transition-all border border-red-100"
          >
            <div>
              <p className="text-sm font-semibold text-orange-700">{alerts.pendingDrivers} Pending Drivers</p>
              <p className="text-xs text-gray-500 mt-0.5">Documents need review</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {alerts.failedOrders > 0 && (
          <button 
            onClick={() => navigate('/orders')}
            className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow text-left transition-all border border-red-100"
          >
            <div>
              <p className="text-sm font-semibold text-red-700">{alerts.failedOrders} Failed Orders</p>
              <p className="text-xs text-gray-500 mt-0.5">Require manual intervention</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {Object.values(alerts).every(v => v === 0) && (
          <div className="p-4 text-center bg-white rounded-xl opacity-75">
            <p className="text-sm text-green-600 font-medium">All caught up!</p>
          </div>
        )}
      </div>
    </Card>
  );
};
