'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateGroupPopup from './CreateGroupPopup';

interface NavbarProps {
  onRefreshDevices?: () => void;
}

export default function Navbar({ onRefreshDevices }: NavbarProps) {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:h-16 py-3 sm:py-0">
          <div className="flex justify-center sm:justify-start mb-3 sm:mb-0">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nexus Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <button
              onClick={onRefreshDevices}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh Devices
            </button>
            <button
              onClick={() => setIsCreatePopupOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Group
            </button>
          </div>
        </div>
      </div>

      <CreateGroupPopup
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
        onGroupCreated={() => {
          setIsCreatePopupOpen(false);
          router.refresh();
        }}
      />
    </nav>
  );
}