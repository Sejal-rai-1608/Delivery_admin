import React from 'react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="overflow-x-auto border-b border-gray-200">
      <nav className="-mb-px flex min-w-max space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-[var(--color-brand-600)] text-[var(--color-brand-600)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block',
                    isActive
                      ? 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
