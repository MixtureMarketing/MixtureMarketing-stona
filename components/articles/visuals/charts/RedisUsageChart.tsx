import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const RedisUsageChart = () => {
  const data = [
    { name: 'Caching', value: 50, color: '#06b6d4' },
    { name: 'Sessions', value: 20, color: '#3b82f6' },
    { name: 'Queues', value: 15, color: '#8b5cf6' },
    { name: 'Analytics', value: 15, color: '#ec4899' },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#4b5563"
          width={80}
          tick={{ fontSize: 12, fontWeight: 600 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderColor: '#e5e7eb',
            color: '#1f2937',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          itemStyle={{ color: '#1f2937', fontWeight: 600 }}
          cursor={{ fill: '#f3f4f6' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RedisUsageChart;
