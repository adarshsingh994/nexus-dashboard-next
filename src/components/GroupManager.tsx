'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateGroupPopup from './CreateGroupPopup';
import { useToast } from './Toast';
import { Switch } from '@headlessui/react';
import ColorPicker from './ColorPicker';

export interface Group {
  id: string;
  name: string;
  description: string;
  parentGroups: string[];
  childGroups: string[];
  bulbs: string[];
}

interface GroupLightState {
  [groupId: string]: {
    isOn: boolean;
    isLoading: boolean;
    colorLoading?: boolean;
  };
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [lightStates, setLightStates] = useState<GroupLightState>({});
  const { showToast } = useToast();
  const router = useRouter();

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
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
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
      )}

      <CreateGroupPopup
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
        onGroupCreated={fetchGroups}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Groups</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{groups.length} total</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.style.boxShadow = '';
                
                try {
                  const data = JSON.parse(e.dataTransfer.getData('application/json'));
                  const response = await fetch(`${baseUrl}/groups/${group.id}/members`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                  });
                  
                  const result = await response.json();
                  if (!result.success) {
                    throw new Error(result.message || 'Failed to add device to group');
                  }
                  
                  // Show success toast, refresh groups and notify device list to update
                  showToast('Device added to group successfully', 'success');
                  await fetchGroups();
                  window.dispatchEvent(new Event('deviceAddedToGroup'));
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Failed to add device to group';
                  setError(errorMessage);
                  showToast(errorMessage, 'error');
                }
              }}
              onTouchMove={(e) => {
                e.preventDefault(); // Prevent scrolling while dragging
                const touch = e.touches[0];
                const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
                
                // Reset highlight on all groups
                document.querySelectorAll('.group-card').forEach(el => {
                  (el as HTMLElement).style.boxShadow = '';
                });
                
                // Highlight the group under the touch point
                const groupCard = elements.find(el => el.classList.contains('group-card'));
                if (groupCard) {
                  (groupCard as HTMLElement).style.boxShadow = '0 0 0 2px #3b82f6';
                }
              }}
              onTouchEnd={async (e) => {
                const touch = e.changedTouches[0];
                const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
                const groupCard = elements.find(el => el.classList.contains('group-card'));
                
                if (groupCard) {
                  const draggedElement = e.target as HTMLElement;
                  const deviceData = draggedElement.dataset.deviceData;
                  
                  if (deviceData) {
                    try {
                      const data = JSON.parse(deviceData);
                      const groupId = (groupCard as HTMLElement).dataset.groupId;
                      
                      const response = await fetch(`${baseUrl}/groups/${groupId}/members`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                      });
                      
                      const result = await response.json();
                      if (!result.success) {
                        throw new Error(result.message || 'Failed to add device to group');
                      }
                      
                      // Show success toast, refresh groups and notify device list to update
                      showToast('Device added to group successfully', 'success');
                      await fetchGroups();
                      window.dispatchEvent(new Event('deviceAddedToGroup'));
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : 'Failed to add device to group';
                      setError(errorMessage);
                      showToast(errorMessage, 'error');
                    }
                  }
                }
                
                // Reset all highlights
                document.querySelectorAll('.group-card').forEach(el => {
                  (el as HTMLElement).style.boxShadow = '';
                });
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group-card aspect-square"
              data-group-id={group.id}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                  <Switch
                    checked={lightStates[group.id]?.isOn || false}
                    onChange={(checked) => toggleLights(group.id, checked)}
                    className={`${
                      lightStates[group.id]?.isOn ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        lightStates[group.id]?.isOn ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">{group.description}</p>
                <div className="mt-auto space-y-1.5">
                  {(lightStates[group.id]?.isLoading || lightStates[group.id]?.colorLoading) && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5">
                      <div className="bg-blue-600 h-0.5 rounded-full animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                    </div>
                  )}
                  <div className="w-full">
                    <ColorPicker
                      onColorSelect={(color) => setColor(group.id, color)}
                      onWhiteSelect={(type) => setWhiteTemperature(group.id, type)}
                      isLoading={lightStates[group.id]?.colorLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">ID: {group.id}</span>
                    <button
                      onClick={() => router.push(`/group/${group.id}`)}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {groups.length === 0 && (
            <div className="col-span-full">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No groups found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new group</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}