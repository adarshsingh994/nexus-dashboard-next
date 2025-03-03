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
    <div className="w-full min-h-screen p-2 sm:p-3 md:p-4 lg:p-6">
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
        
        {/* Compact grid layout with smaller gaps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
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
                {/* Compact Power Toggle Button - Focus on power functionality */}
                <div className="flex flex-col h-full">
                  {/* Header with room name */}
                  <div className="px-2 pt-2 pb-1 text-center">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white truncate max-w-full">{group.name}</h3>
                  </div>
                  
                  {/* Compact Power Button */}
                  <button
                    onClick={() => toggleLights(group.id, !isOn)}
                    disabled={isLoading}
                    className={`
                      flex-1 flex flex-col items-center justify-center py-2 px-1
                      ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                      ${isOn ? 'bg-primary/10 dark:bg-primary/20' : 'bg-gray-50 dark:bg-gray-800'}
                      transition-colors duration-300
                    `}
                    aria-pressed={isOn}
                    aria-label={`Toggle ${group.name} lights`}
                  >
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center mb-1
                      ${isOn ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                      transition-colors duration-300 shadow
                    `}>
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    
                    <span className={`text-sm font-medium ${isOn ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isOn ? 'ON' : 'OFF'}
                    </span>
                    
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/5 dark:bg-black/20 flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </button>
                  
                  {/* Footer with minimal controls */}
                  <div className="px-1 py-1 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => toggleColorPicker(group.id)}
                      className="p-1 text-gray-500 hover:text-primary transition-colors"
                      aria-label="Color controls"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/group/${group.id}`)}
                      className="p-1 text-gray-500 hover:text-primary transition-colors"
                      aria-label="View details"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Horizontally Scrollable Color Picker */}
                  {isColorPickerExpanded && (
                    <div className="color-picker-scrollable p-2 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top duration-200">
                      <style jsx>{`
                        /* Make the color picker horizontally scrollable */
                        .color-picker-scrollable :global(.grid-cols-3) {
                          display: flex !important;
                          flex-wrap: nowrap !important;
                          overflow-x: auto !important;
                          scrollbar-width: none !important; /* Firefox */
                          -ms-overflow-style: none !important; /* IE and Edge */
                          padding-bottom: 4px !important;
                        }
                        
                        /* Hide scrollbar for Chrome, Safari and Opera */
                        .color-picker-scrollable :global(.grid-cols-3)::-webkit-scrollbar {
                          display: none !important;
                        }
                        
                        /* Make the color boxes fixed width */
                        .color-picker-scrollable :global(.aspect-square) {
                          width: 2rem !important;
                          height: 2rem !important;
                          min-height: 2rem !important;
                          flex: 0 0 auto !important;
                          margin-right: 0.5rem !important;
                        }
                        
                        /* Make the warm/cold buttons smaller and fixed width */
                        .color-picker-scrollable :global(.grid-cols-2) {
                          display: flex !important;
                          gap: 0.5rem !important;
                          margin-bottom: 0.5rem !important;
                        }
                        
                        .color-picker-scrollable :global(.h-8) {
                          height: 1.75rem !important;
                          flex: 1 !important;
                          display: flex !important;
                          justify-content: center !important;
                          align-items: center !important;
                        }
                        
                        /* Make the text smaller */
                        .color-picker-scrollable :global(.md-body-medium) {
                          font-size: 0.75rem !important;
                        }
                      `}</style>
                      <ColorPicker
                        onColorSelect={(color) => setColor(group.id, color)}
                        onWhiteSelect={(type) => setWhiteTemperature(group.id, type)}
                        isLoading={lightStates[group.id]?.colorLoading}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {groups.length === 0 && (
           <div className="col-span-full">
             <div className="md-card p-4 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center mb-3 shadow">
                 <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No groups yet</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                 Create your first group to start controlling your lights
               </p>
               <button
                 onClick={onCreateClose}
                 className="md-button md-button-primary flex items-center justify-center gap-1 py-2 px-4 w-full max-w-xs text-sm"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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