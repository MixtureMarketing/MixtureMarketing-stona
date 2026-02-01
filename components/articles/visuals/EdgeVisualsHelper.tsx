import React from 'react';

export const BenefitCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <div
      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-xl"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="font-bold text-dark mb-2">{title}</h3>
    <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
  </div>
);

export const EdgeCodeBlock = () => {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 not-prose">
      <div className="bg-[#252526] px-4 py-3 border-b border-[#333] flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-gray-600 text-xxs font-bold uppercase tracking-widest">
          cloudflare-worker.js
        </span>
      </div>
      <div className="p-6 font-mono text-sm overflow-x-auto">
        <pre>
          <code className="text-gray-300">
            {`export default {
  async fetch(request, env) {
    // Ta funkcja uruchomi się w lokalizacji 
    // najbliższej użytkownika (np. w Warszawie).
    
    const country = request.cf.country;
    
    if (country === 'PL') {
      return new Response("Cześć! Witamy lokalnie!");
    }
    
    return new Response("Hello global user!");
  },
};`}
          </code>
        </pre>
      </div>
    </div>
  );
};
