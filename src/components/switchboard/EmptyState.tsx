'use client';

interface EmptyStateProps {
  onCreateGroup: () => void;
}

export function EmptyState({ onCreateGroup }: EmptyStateProps) {
  return (
    <div className="col-span-full">
      <div
        className="p-6 flex flex-col items-center text-center rounded-3xl transition-all duration-500"
        style={{
          background: '#EEF4FF',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
          animation: 'fadeIn 0.8s ease-out'
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500"
          style={{
            background: '#EEF4FF',
            boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
            animation: 'pulse 3s infinite ease-in-out'
          }}
        >
          <svg
            className="w-8 h-8 text-blue-500 transition-all duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{
              filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))',
              animation: 'float 3s infinite ease-in-out'
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No groups yet
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create your first group to start controlling your lights
        </p>
        <button
          onClick={onCreateGroup}
          className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-blue-500 rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.98]"
          style={{
            background: '#EEF4FF',
            boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.boxShadow = '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff';
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create First Group
        </button>
      </div>
    </div>
  );
}