import React from 'react';
import { Card } from '../ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface ChartCardProps {
  title: string;
  type: 'area' | 'bar' | 'pie';
  data: any[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  colors?: string[];
  height?: number;
  valueFormatter?: (value: any) => string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title, type, data, dataKey, nameKey = 'name', color = 'var(--color-brand-500)', colors = [], height = 300, valueFormatter
}) => {
  const formatYAxis = (val: any) => {
    if (val >= 1000) return `$${val/1000}k`;
    return val;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex-1" style={{ minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={valueFormatter || formatYAxis} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [valueFormatter ? valueFormatter(value) : value, title]}
              />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${dataKey})`} />
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} tickFormatter={valueFormatter || formatYAxis} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [valueFormatter ? valueFormatter(value) : value, title]}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {type === 'pie' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
           {data.map((entry, index) => (
             <div key={entry[nameKey]} className="flex items-center text-xs text-gray-600">
               <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
               {entry[nameKey]}: <span className="font-semibold ml-1">{entry[dataKey]}</span>
             </div>
           ))}
        </div>
      )}
    </Card>
  );
};
