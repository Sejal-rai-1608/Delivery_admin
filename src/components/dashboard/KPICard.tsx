import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  growth?: number;
  growthText?: string;
  colorScheme: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

const colorMap = {
  green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
};

export const KPICard: React.FC<KPICardProps> = ({ 
  title, value, icon: Icon, growth, growthText, colorScheme, onClick 
}) => {
  const colors = colorMap[colorScheme];
  
  return (
    <Card 
      className={cn("transition-all duration-300", onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "")}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
      {(growth !== undefined || growthText) && (
        <div className="mt-4 flex items-center text-sm">
          {growth !== undefined && (
            <>
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={cn("font-medium", growth >= 0 ? "text-green-500" : "text-red-500")}>
                {growth > 0 ? '+' : ''}{growth}%
              </span>
            </>
          )}
          {growthText && <span className="text-gray-400 ml-2">{growthText}</span>}
        </div>
      )}
    </Card>
  );
};
