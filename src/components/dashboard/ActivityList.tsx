import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Building2, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityListProps {
  data: {
    companies: any[];
    drivers: any[];
    orders: any[];
  };
}

export const ActivityList: React.FC<ActivityListProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        {/* Companies */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Companies</h4>
          <div className="space-y-3">
            {data.companies.map(company => (
              <div 
                key={company.id} 
                onClick={() => navigate(`/companies/${company.id}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">{new Date(company.registrationDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusBadge status={company.status} type="company" />
              </div>
            ))}
          </div>
        </div>

        {/* Drivers */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Drivers</h4>
          <div className="space-y-3">
            {data.drivers.map(driver => (
              <div 
                key={driver.id} 
                onClick={() => navigate(`/drivers/${driver.id}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.vehicleType}</p>
                  </div>
                </div>
                <StatusBadge status={driver.status} type="driver" />
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Orders</h4>
          <div className="space-y-3">
            {data.orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => navigate(`/orders/${order.id}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">${order.price.toFixed(2)}</p>
                  </div>
                </div>
                <StatusBadge status={order.status} type="order" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
