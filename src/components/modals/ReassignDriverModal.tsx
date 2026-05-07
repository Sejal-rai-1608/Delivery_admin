import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';
import { Driver } from '../../types';

interface ReassignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (driverId: string) => void;
  drivers: Driver[];
}

export const ReassignDriverModal: React.FC<ReassignDriverModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  drivers,
}) => {
  const [selectedDriver, setSelectedDriver] = useState('');

  if (!isOpen) return null;

  const availableDrivers = drivers.filter(d => d.status === 'APPROVED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="text-[var(--color-brand-600)]" /> Reassign Driver
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select an available driver
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-500)]"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
          >
            <option value="" disabled>Choose a driver...</option>
            {availableDrivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.vehicleType})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedDriver)}
            disabled={!selectedDriver}
            className="px-4 py-2 text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
          >
            Reassign Order
          </button>
        </div>
      </div>
    </div>
  );
};
