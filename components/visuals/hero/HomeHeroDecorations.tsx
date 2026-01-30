import React from 'react';
import { Code2, BarChart3 } from 'lucide-react';
import { HERO_CONTENT } from '../../../data/content';

interface FloatingElementProps {
  mousePosition: { x: number; y: number };
}

export const BrowserMockup: React.FC<FloatingElementProps> = ({ mousePosition }) => (
  <div
    className="absolute top-[15%] -left-20 w-64 h-48 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-2xl hidden xl:block transition-transform duration-300 ease-out animate-float"
    style={{
      transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px) rotate(-12deg)`,
      animationDelay: '0s',
    }}
  >
    <div className="flex gap-1.5 p-3 border-b border-white/20">
      <div className="w-2 h-2 rounded-full bg-red-400"></div>
      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
      <div className="w-2 h-2 rounded-full bg-green-400"></div>
    </div>
    <div className="p-4 space-y-2">
      <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-2 w-full bg-gray-100 rounded"></div>
      <div className="h-12 w-full bg-blue-50 rounded-lg mt-4 animate-pulse"></div>
    </div>
  </div>
);

export const CodeSnippet: React.FC<FloatingElementProps> = ({ mousePosition }) => (
  <div
    className="absolute top-[60%] -right-10 w-auto min-w-[300px] h-auto min-h-[160px] bg-dark rounded-2xl border border-white/10 shadow-2xl hidden xl:block transition-transform duration-300 ease-out p-6 font-mono text-xxs animate-float"
    style={{
      transform: `translate(${mousePosition.x / -40}px, ${mousePosition.y / -40}px) rotate(8deg)`,
      animationDelay: '1s',
    }}
  >
    <div className="text-blue-400">
      const <span className="text-purple-400">growth</span> = {'{'}
    </div>
    <div className="pl-4 text-gray-600 italic">{HERO_CONTENT.visuals.codeSnippet.comment}</div>
    <div className="pl-4 text-green-400">
      strategy: "{HERO_CONTENT.visuals.codeSnippet.strategy}",
    </div>
    <div className="pl-4 text-green-400">roas: "1250%",</div>
    <div className="pl-4 text-green-400">status: "{HERO_CONTENT.visuals.codeSnippet.status}"</div>
    <div className="text-blue-400">{'}'};</div>
    <div className="absolute bottom-4 right-6 text-primary opacity-20">
      <Code2 size={40} />
    </div>
  </div>
);

export const AdsDashboardMini: React.FC<FloatingElementProps> = ({ mousePosition }) => (
  <div
    className="absolute top-[20%] right-[10%] w-48 h-48 bg-white/60 backdrop-blur-lg rounded-3xl border border-white shadow-2xl hidden lg:block transition-transform duration-500 ease-out animate-float"
    style={{
      transform: `translate(${mousePosition.x / 60}px, ${mousePosition.y / 60}px) rotate(5deg)`,
      animationDelay: '2s',
    }}
  >
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="w-8 h-8 rounded-lg bg-instagram flex items-center justify-center text-white">
          <BarChart3 size={16} />
        </div>
        <div className="text-xxs font-black text-dark uppercase tracking-widest">Meta Ads</div>
      </div>
      <div className="space-y-3">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-instagram rounded-full"></div>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full"></div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-xxxs font-bold text-gray-600 uppercase">Conversion</div>
          <div className="text-xxs font-black text-success">+24%</div>
        </div>
      </div>
    </div>
  </div>
);
