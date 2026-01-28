import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface BrowserSupportChartProps {
  title: string;
  percent: number;
  color: string;
}

const ImageWeightChart: React.FC<BrowserSupportChartProps> = ({ title, percent, color }) => {
  const data = [
    { name: 'Supported', value: percent },
    { name: 'Unsupported', value: 100 - percent },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center w-full h-full">
      <div className="h-40 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-black text-dark">{percent}%</span>
        </div>
      </div>
      <h3 className="font-bold text-lg text-dark mt-4 mb-2">{title}</h3>
      <p className="text-xs text-gray-600 font-medium">Globalne wsparcie (CanIUse 2025)</p>
    </div>
  );
};

export default ImageWeightChart;
