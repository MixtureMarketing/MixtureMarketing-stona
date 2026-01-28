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

const MarketGrowthChart = () => {
  const data = [
    { year: '2018', value: 1.2 },
    { year: '2020', value: 4.5 },
    { year: '2022', value: 12.8 },
    { year: '2024', value: 35.2 },
    { year: '2026', value: 88.4 },
    { year: '2028', value: 195.0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#61B6DE" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#61B6DE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="ZB" />
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#213261',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
          }}
          itemStyle={{ color: '#61B6DE', fontWeight: 'bold' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Dane na brzegu (ZB)"
          stroke="#61B6DE"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorGrowth)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MarketGrowthChart;
