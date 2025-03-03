'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onRefreshDevices?: () => void;
  onCreateGroup?: () => void;
}

export default function Navbar({ onRefreshDevices, onCreateGroup }: NavbarProps) {
  const pathname = usePathname();
  
  return (
    <nav className="bg-surface dark:bg-gray-800/95 shadow-elevation-2 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 text-primary">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h1 className="md-headline-medium text-gray-900 dark:text-white">
                Nexus Dashboard
              </h1>
            </div>
            
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md md-body-large ${
                  pathname === '/'
                    ? 'text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/switchboard"
                className={`px-3 py-2 rounded-md md-body-large ${
                  pathname === '/switchboard'
                    ? 'text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Switchboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshDevices}
              className="md-button group inline-flex items-center justify-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2 transition-transform group-hover:rotate-180 duration-500" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="md-body-large">Refresh Devices</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="md-button md-button-primary group inline-flex items-center justify-center px-4 py-2.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2 transition-transform group-hover:rotate-180 duration-500" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="md-body-large">Create Group</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}