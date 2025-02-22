'use client';

import { useState, useEffect } from 'react';

interface Bulb {
  ip: string;
  name: string;
  state: {
    isOn: boolean;
    brightness: number;
    rgb: [number, number, number];
  };
  features: {
    brightness: boolean;
    color: boolean;
    color_tmp: boolean;
    effect: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  parentGroups: string[];
  childGroups: string[];
  bulbs: string[];
}

interface GroupDetailsProps {
  groupId: string;
  onBack: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function GroupDetails({ groupId, onBack }: GroupDetailsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}`);
      const data = await response.json();
      
      if (data.success) {
        setGroup(data.data.group);
        setBulbs(data.data.bulbs);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch group details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-r">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Groups
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{group.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{group.description}</p>

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Group Information</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">ID:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{group.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Parent Groups:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {group.parentGroups.length > 0 ? group.parentGroups.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Child Groups:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {group.childGroups.length > 0 ? group.childGroups.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connected Bulbs</h2>
            {bulbs.length > 0 ? (
              <div className="grid gap-4">
                {bulbs.map((bulb) => (
                  <div key={bulb.ip} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{bulb.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">IP: {bulb.ip}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${bulb.state.isOn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{bulb.state.isOn ? 'On' : 'Off'}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Brightness: {bulb.state.brightness}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No bulbs connected to this group</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}