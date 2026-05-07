import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'danger' | 'success' | 'warning';
  hidden?: boolean;
}

interface ActionDropdownProps {
  actions: Action[];
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter(a => !a.hidden);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (visibleActions.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {visibleActions.map((action, index) => {
            let colorClasses = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";
            if (action.color === 'danger') colorClasses = "text-red-600 hover:bg-red-50";
            if (action.color === 'success') colorClasses = "text-green-600 hover:bg-green-50";
            if (action.color === 'warning') colorClasses = "text-orange-600 hover:bg-orange-50";

            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors",
                  colorClasses
                )}
              >
                <span className="opacity-70">{action.icon}</span>
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
