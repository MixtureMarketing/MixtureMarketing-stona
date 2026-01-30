import React from 'react';

export const CodeVisual: React.FC = () => (
  <div className="flex gap-2 p-3 bg-gray-900 rounded-lg w-full font-mono text-xxs text-green-400 opacity-80 mt-4 relative overflow-hidden group-hover:opacity-100 transition-opacity">
    <div className="w-1 h-full bg-green-500/20 absolute left-0 top-0 animate-pulse"></div>
    <div>
      <p>
        <span className="text-purple-400">const</span> profit ={' '}
        <span className="text-yellow-400">true</span>;
      </p>
      <p>
        <span className="text-blue-400">while</span>(alive) {'{'}
      </p>
      <p className="pl-2 animate-pulse">buildAwesomeStuff();</p>
      <p>{'}'}</p>
    </div>
  </div>
);

export const ChartVisual: React.FC = () => (
  <div className="flex items-end gap-1.5 h-16 w-full mt-4 px-2 pb-2 border-b border-gray-200">
    {[30, 50, 40, 70, 90].map((h, i) => (
      <div
        key={i}
        className="flex-1 bg-blue-50 rounded-t-sm group-hover:bg-primary transition-all duration-700"
        style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}
      ></div>
    ))}
  </div>
);

export const UiVisual: React.FC = () => (
  <div className="grid grid-cols-2 gap-2 mt-4 w-full relative">
    <div className="h-12 bg-gray-100 rounded-lg border border-gray-200 group-hover:border-primary transition-colors"></div>
    <div className="h-12 bg-secondary rounded-lg opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"></div>
    <div className="h-6 bg-primary rounded-lg col-span-2 opacity-60 group-hover:opacity-80 transition-opacity"></div>
  </div>
);
