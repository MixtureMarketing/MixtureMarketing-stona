/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ServerLoadChart = () => {
  const data = [
    { time: '10:00', noCdn: 40, withCdn: 10 },
    { time: '10:05', noCdn: 65, withCdn: 12 },
    { time: '10:10', noCdn: 95, withCdn: 15 },
    { time: '10:15', noCdn: 85, withCdn: 14 },
    { time: '10:20', noCdn: 90, withCdn: 13 },
    { time: '10:25', noCdn: 55, withCdn: 11 },
    { time: '10:30', noCdn: 45, withCdn: 10 },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNoCdn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F43F5E" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#F43F5E" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="colorWithCdn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="%" />
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
        <Area
          type="monotone"
          dataKey="noCdn"
          name="Bez CDN (Load)"
          stroke="#F43F5E"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorNoCdn)"
        />
        <Area
          type="monotone"
          dataKey="withCdn"
          name="Z CDN (Load)"
          stroke="#10B981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorWithCdn)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ServerLoadChart;
