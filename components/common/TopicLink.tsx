import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import BaseCard from './BaseCard';

interface TopicLinkProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  target: string;
  status: 'ready' | 'coming-soon';
}

const TopicLink: React.FC<TopicLinkProps> = ({ icon, title, desc, target, status }) => (
  <Link
    to={status === 'ready' ? target : '#'}
    className={`group h-full flex flex-col ${status === 'coming-soon' ? 'opacity-80 cursor-not-allowed' : ''}`}
  >
    <BaseCard
      variant={status === 'ready' ? 'muted' : 'muted'}
      hover={status === 'ready' ? 'lift' : 'none'}
      className={`h-full flex flex-row items-start gap-4 ${status === 'coming-soon' ? 'border-dashed border-gray-200' : ''}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-dark group-hover:text-secondary transition-colors">
            {title}
          </h3>
          {status === 'coming-soon' && (
            <span className="text-xxxs font-black uppercase tracking-widest bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              Soon
            </span>
          )}
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">{desc}</p>
      </div>
      {status === 'ready' && (
        <ChevronRight
          size={18}
          className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all mt-1"
        />
      )}
    </BaseCard>
  </Link>
);

export default TopicLink;
