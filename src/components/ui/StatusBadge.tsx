import React from 'react';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: string;
  type?: 'company' | 'driver' | 'order';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED':
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(status),
        className
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
};
