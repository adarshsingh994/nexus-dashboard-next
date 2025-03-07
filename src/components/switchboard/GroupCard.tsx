'use client';

import { GroupCardProps } from './types';

export function GroupCard({ 
  group, 
  lightState, 
  onToggleLights, 
  onLongPress 
}: GroupCardProps) {
  const isOn = lightState?.isOn || false;
  const isLoading = lightState?.isLoading || false;

  return (
    <div
      className="overflow-hidden rounded-3xl transition-all duration-300 hover:translate-y-[-2px]"
      onTouchStart={(e) => {
        e.preventDefault();
        onLongPress(group.id);
      }}
      data-group-id={group.id}
      style={{
        background: '#EEF4FF',
        boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Card header */}
      <div className="px-3 py-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">{group.name}</h3>
      </div>
      
      {/* Power button */}
      <button
        onClick={() => onToggleLights(group.id, !isOn)}
        disabled={isLoading}
        className={`
          group
          w-full px-3 py-4 flex items-center justify-center relative overflow-hidden
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
          transition-all duration-300
          active:scale-[0.98]
        `}
        style={{
          WebkitTapHighlightColor: 'transparent',
          background: '#EEF4FF'
        }}
        aria-pressed={isOn}
        aria-label={`Toggle ${group.name} lights`}
      >
        <div className="flex flex-col items-center relative z-10">
          {/* Power icon with circular progress - neumorphic style */}
          <div className="relative">
            {/* Circular progress indicator - perfectly aligned with button circumference */}
            {isLoading && (
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12"
                viewBox="0 0 100 100"
                style={{ position: 'absolute', zIndex: 5 }}
              >
                <circle
                  className="text-gray-200"
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="302"
                  strokeDashoffset="0"
                />
                <circle
                  className="text-blue-500 transition-all duration-300"
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="302"
                  strokeDashoffset="302"
                  strokeLinecap="round"
                  style={{
                    animation: 'circleProgress 1.5s ease-in-out infinite',
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)'
                  }}
                />
              </svg>
            )}
            
            {/* Power button */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-2
                ${isOn ? 'text-blue-500' : 'text-gray-500'}
                transition-all duration-300 transform relative z-10
                ${isLoading ? 'scale-95' : 'scale-100'}
                group-active:scale-95
              `}
              style={{
                background: '#EEF4FF',
                boxShadow: isOn
                  ? 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff, 0 0 0 6px rgba(59, 130, 246, 0.1)'
                  : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
                transition: 'box-shadow 0.3s ease, transform 0.2s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = 'inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = isOn
                  ? 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff, 0 0 0 6px rgba(59, 130, 246, 0.1)'
                  : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isOn
                  ? 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff, 0 0 0 6px rgba(59, 130, 246, 0.1)'
                  : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.boxShadow = 'inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.boxShadow = isOn
                  ? 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff, 0 0 0 6px rgba(59, 130, 246, 0.1)'
                  : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
              }}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isOn ? 'scale-110' : 'scale-100'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{
                  filter: isOn ? 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))' : 'none',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          {/* Status text */}
          <div className="text-xs font-medium relative h-4 overflow-hidden">
            <div className={`flex items-center transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <span
                className={`inline-block transition-all duration-300 ${isOn ? 'text-blue-500 transform translate-y-0' : 'text-gray-600 transform translate-y-0'}`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {isOn ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </button>
      
      {/* Long press hint */}
      <div className="text-center py-1 text-[10px] text-gray-400 border-t border-gray-100">
        Long press for options
      </div>
    </div>
  );
}