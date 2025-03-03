'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateGroupPopup from './CreateGroupPopup';
import { useToast } from './Toast';
import ColorPicker from './ColorPicker';

export interface Group {
  id: string;
  name: string;
  description: string;
  parentGroups: string[];
  childGroups: string[];
  bulbs: string[];
  isOn: boolean;
}

interface GroupLightState {
  [groupId: string]: {
    isOn: boolean;
    isLoading: boolean;
    colorLoading?: boolean;
  };
}

interface SwitchboardProps {
  isCreateOpen?: boolean;
  onCreateClose?: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function Switchboard({ isCreateOpen = false, onCreateClose = () => {} }: SwitchboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');
  const [lightStates, setLightStates] = useState<GroupLightState>({});
  const [expandedColorPickers, setExpandedColorPickers] = useState<{[groupId: string]: boolean}>({});
  const { showToast } = useToast();
  const router = useRouter();
  
  // Toggle color picker expanded state
  const toggleColorPicker = (groupId: string) => {
    setExpandedColorPickers(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const setWhiteTemperature = async (groupId: string, type: 'warm' | 'cold') => {
    setLightStates(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], colorLoading: true }
    }));

    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: type === 'warm' ? 'setWarmWhite' : 'setColdWhite',
          params: {
            intensity: 255
          }
        })
      });

      const result = await response.json();
      
      setLightStates(prev => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          colorLoading: false
        }
      }));

      if (!result.overall_success) {
        showToast(result.message || `Failed to set ${type} white`, 'error');
      }
    } catch (err) {
      setLightStates(prev => ({
        ...prev,
        [groupId]: { ...prev[groupId], colorLoading: false }
      }));
      const errorMessage = err instanceof Error ? err.message : `Failed to set ${type} white`;
      showToast(errorMessage, 'error');
    }
  };

  const setColor = async (groupId: string, color: [number, number, number]) => {
    setLightStates(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], colorLoading: true }
    }));

    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setColor',
          params: {
            color: color
          }
        })
      });

      const result = await response.json();
      
      setLightStates(prev => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          colorLoading: false
        }
      }));

      if (!result.overall_success) {
        showToast(result.message || 'Failed to set color', 'error');
      }
    } catch (err) {
      setLightStates(prev => ({
        ...prev,
        [groupId]: { ...prev[groupId], colorLoading: false }
      }));
      const errorMessage = err instanceof Error ? err.message : 'Failed to set color';
      showToast(errorMessage, 'error');
    }
  };

  const toggleLights = async (groupId: string, turnOn: boolean) => {
    setLightStates(prev => ({
      ...prev,
      [groupId]: { isOn: prev[groupId]?.isOn || false, isLoading: true }
    }));

    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: turnOn ? 'turnOn' : 'turnOff'
        })
      });

      const result = await response.json();
      
      setLightStates(prev => ({
        ...prev,
        [groupId]: {
          isOn: result.overall_success ? turnOn : false,
          isLoading: false
        }
      }));

      if (!result.overall_success) {
        showToast(result.message || 'Some lights failed to respond', 'error');
      }
    } catch (err) {
      setLightStates(prev => ({
        ...prev,
        [groupId]: { isOn: false, isLoading: false }
      }));
      const errorMessage = err instanceof Error ? err.message : 'Failed to control lights';
      showToast(errorMessage, 'error');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${baseUrl}/groups`);
      const data = await response.json();
      if (data.success) {
        setGroups(data.data.groups);
        
        // Initialize lightStates with isOn values from API response
        const initialLightStates: GroupLightState = {};
        data.data.groups.forEach((group: Group) => {
          initialLightStates[group.id] = {
            isOn: group.isOn ?? false, // Use nullish coalescing for backward compatibility
            isLoading: false
          };
        });
        setLightStates(initialLightStates);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      {error && (
        <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 mb-8 max-w-6xl mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="md-body-large text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <CreateGroupPopup
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onGroupCreated={fetchGroups}
      />

      <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md-headline-large text-gray-900 dark:text-white">Switchboard</h1>
            <p className="md-body-medium text-gray-500 dark:text-gray-400 mt-1">
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
            </p>
          </div>
        </div>
        
        {/* Updated grid layout: 1 column on very small screens, 2 columns on small+ screens, 3 on large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {groups.map((group) => {
            const isOn = lightStates[group.id]?.isOn || false;
            const isLoading = lightStates[group.id]?.isLoading || false;
            const isColorPickerExpanded = expandedColorPickers[group.id] || false;
            
            return (
              <div
                key={group.id}
                className="md-card overflow-hidden transition-all duration-300 hover:shadow-elevation-3"
                data-group-id={group.id}
              >
                {/* Redesigned Power Toggle Button - More compact and tap-friendly */}
                <button
                  onClick={() => toggleLights(group.id, !isOn)}
                  disabled={isLoading}
                  className={`
                    w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOn ? 'bg-primary/10 dark:bg-primary/20' : 'bg-gray-50 dark:bg-gray-800'}
                    transition-colors duration-300
                  `}
                  aria-pressed={isOn}
                  aria-label={`Toggle ${group.name} lights`}
                >
                  <div className="text-center sm:text-left sm:flex-1 mb-2 sm:mb-0">
                    <h3 className="md-headline-small text-gray-900 dark:text-white truncate max-w-full">{group.name}</h3>
                    <p className="md-body-small text-gray-500 dark:text-gray-400">
                      {group.bulbs.length} {group.bulbs.length === 1 ? 'bulb' : 'bulbs'}
                    </p>
                  </div>
                  
                  <div className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto sm:mx-0 sm:ml-2 flex-shrink-0
                    ${isOn ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    transition-colors duration-300
                  `}>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="sr-only">{isOn ? 'ON' : 'OFF'}</span>
                  </div>
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 flex items-center justify-center">
                      <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </button>

                <div className="p-3 sm:p-4">
                  {/* Description - truncated to save space */}
                  <p className="md-body-small text-gray-600 dark:text-gray-300 line-clamp-1 mb-3 text-center sm:text-left">
                    {group.description}
                  </p>

                  <div className="space-y-3">
                    {/* Color Picker Toggle Button */}
                    <button
                      onClick={() => toggleColorPicker(group.id)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-expanded={isColorPickerExpanded}
                    >
                      <span className="md-body-medium text-gray-700 dark:text-gray-300">Color Controls</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isColorPickerExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Collapsible Color Picker */}
                    {isColorPickerExpanded && (
                      <div className="color-picker-small pt-2 animate-in slide-in-from-top duration-200">
                        <style jsx>{`
                          /* Target the color grid to make it 6 columns instead of 3 */
                          .color-picker-small :global(.grid-cols-3) {
                            grid-template-columns: repeat(6, 1fr) !important;
                            gap: 0.5rem !important;
                          }
                          
                          /* Make the color boxes smaller */
                          .color-picker-small :global(.aspect-square) {
                            height: 2rem !important;
                            min-height: 2rem !important;
                          }
                        `}</style>
                        <ColorPicker
                          onColorSelect={(color) => setColor(group.id, color)}
                          onWhiteSelect={(type) => setWhiteTemperature(group.id, type)}
                          isLoading={lightStates[group.id]?.colorLoading}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="md-body-small text-gray-400 dark:text-gray-500 font-mono truncate max-w-[80px] sm:max-w-[100px]" title={group.id}>
                        {group.id}
                      </span>
                      <button
                        onClick={() => router.push(`/group/${group.id}`)}
                        className="md-button flex items-center gap-1 text-primary hover:text-primary-light transition-colors"
                      >
                        <span className="md-body-small">Details</span>
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {groups.length === 0 && (
           <div className="col-span-full">
             <div className="md-card p-5 sm:p-8 md:p-12 flex flex-col items-center text-center">
               <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
                 <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="md-headline-small sm:md-headline-medium text-gray-900 dark:text-white mb-2">No groups yet</h3>
               <p className="md-body-small sm:md-body-medium md:md-body-large text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8 max-w-md px-2">
                 Create your first group to start managing your smart lights together
               </p>
               <button
                 onClick={onCreateClose}
                 className="md-button md-button-primary flex items-center gap-2 py-2 px-4 sm:py-3 sm:px-6 text-sm sm:text-base md:text-lg"
               >
                 <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
                 Create First Group
               </button>
             </div>
           </div>
         )}
        </div>
      </div>
    </div>
  );
}