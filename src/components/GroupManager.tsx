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
  isOn: boolean;
}

interface GroupLightState {
  [groupId: string]: {
    isOn: boolean;
    isLoading: boolean;
    colorLoading?: boolean;
  };
}

interface GroupManagerProps {
  isCreateOpen?: boolean;
  onCreateClose?: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function GroupManager({ isCreateOpen = false, onCreateClose = () => {} }: GroupManagerProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 mb-8">
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

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md-headline-large text-gray-900 dark:text-white">Groups</h1>
            <p className="md-body-medium text-gray-500 dark:text-gray-400 mt-1">
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'dark:ring-offset-gray-900');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'dark:ring-offset-gray-900');
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'dark:ring-offset-gray-900');
                
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
                  
                  showToast('Device added to group successfully', 'success');
                  await fetchGroups();
                  window.dispatchEvent(new Event('deviceAddedToGroup'));
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Failed to add device to group';
                  setError(errorMessage);
                  showToast(errorMessage, 'error');
                }
              }}
              className="md-card group-card overflow-hidden transition-all duration-300 hover:shadow-elevation-3 cursor-pointer"
              data-group-id={group.id}
            >
              <div className="flex flex-col h-full p-4 sm:p-5">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="md-headline-small text-gray-900 dark:text-white truncate">{group.name}</h3>
                    <p className="md-body-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {group.bulbs.length} {group.bulbs.length === 1 ? 'bulb' : 'bulbs'}
                    </p>
                  </div>
                  <Switch
                    checked={lightStates[group.id]?.isOn || false}
                    onChange={(checked) => toggleLights(group.id, checked)}
                    className={`${
                      lightStates[group.id]?.isOn ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                  >
                    <span className="sr-only">Toggle lights</span>
                    <span
                      className={`${
                        lightStates[group.id]?.isOn ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200`}
                    />
                  </Switch>
                </div>

                <p className="md-body-large text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                  {group.description}
                </p>

                <div className="mt-auto space-y-3">
                  {(lightStates[group.id]?.isLoading || lightStates[group.id]?.colorLoading) && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                      <div className="bg-primary h-1 rounded-full animate-loading"></div>
                    </div>
                  )}
                  
                  <ColorPicker
                    onColorSelect={(color) => setColor(group.id, color)}
                    onWhiteSelect={(type) => setWhiteTemperature(group.id, type)}
                    isLoading={lightStates[group.id]?.colorLoading}
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="md-body-small text-gray-400 dark:text-gray-500 font-mono truncate max-w-[120px]" title={group.id}>
                      {group.id}
                    </span>
                    <button
                      onClick={() => router.push(`/group/${group.id}`)}
                      className="md-button flex items-center gap-1.5 text-primary hover:text-primary-light transition-colors"
                    >
                      <span className="md-body-medium">Details</span>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {groups.length === 0 && (
            <div className="col-span-full">
              <div className="md-card p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="md-headline-medium text-gray-900 dark:text-white mb-2">No groups yet</h3>
                <p className="md-body-large text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  Create your first group to start managing your smart lights together
                </p>
                <button
                  onClick={onCreateClose}
                  className="md-button md-button-primary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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