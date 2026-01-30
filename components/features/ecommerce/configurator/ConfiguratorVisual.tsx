import React from 'react';

interface ConfiguratorVisualProps {
  configBase: 'plastic' | 'chrome';
  configColor: string;
  configArmrests: boolean;
  configHeadrest: boolean;
  getColorHex: (color: string) => string;
}

const ConfiguratorVisual: React.FC<ConfiguratorVisualProps> = ({
  configBase,
  configColor,
  configArmrests,
  configHeadrest,
  getColorHex,
}) => {
  return (
    <div className="flex-1 bg-gray-50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-gray-200 group/viz shadow-inner mb-6">
      <div className="w-full h-full p-8 md:p-12 flex items-center justify-center transition-all duration-700 transform group-hover/viz:scale-105">
        <svg
          viewBox="0 0 100 140"
          className="max-w-full max-h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            <rect
              x="48"
              y="88"
              width="4"
              height="27"
              fill={configBase === 'chrome' ? '#94a3b8' : '#333'}
            />
            <path
              d="M50 115 L20 135 M50 115 L80 135 M50 115 L50 138"
              stroke={configBase === 'chrome' ? '#94a3b8' : '#333'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="20" cy="135" r="3" fill="#111" />
            <circle cx="80" cy="135" r="3" fill="#111" />
            <circle cx="50" cy="138" r="3" fill="#111" />
          </g>
          <path
            d="M20 80 Q50 90 80 80 L85 75 Q50 85 15 75 Z"
            fill={getColorHex(configColor)}
            stroke="#111"
            strokeWidth="0.5"
          />
          <path
            d="M25 75 L22 25 Q50 15 78 25 L75 75 Q50 85 25 75 Z"
            fill={getColorHex(configColor)}
            stroke="#111"
            strokeWidth="0.5"
          />
          <g className={configArmrests ? 'opacity-100' : 'opacity-0'}>
            <path d="M15 75 L12 60 L25 60" fill="none" stroke="#333" strokeWidth="3" />
            <path d="M85 75 L88 60 L75 60" fill="none" stroke="#333" strokeWidth="3" />
          </g>
          <g className={configHeadrest ? 'opacity-100' : 'opacity-0'}>
            <rect
              x="35"
              y="8"
              width="30"
              height="12"
              rx="4"
              fill={getColorHex(configColor)}
              stroke="#111"
              strokeWidth="0.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ConfiguratorVisual;
