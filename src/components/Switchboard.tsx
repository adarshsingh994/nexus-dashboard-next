'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

// Long press popup component
interface LongPressPopupProps {
  groupId: string; // Needed for the parent component
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number }; // Kept for interface compatibility
  onColorSelect: (color: [number, number, number]) => Promise<void>;
  onWhiteSelect: (type: 'warm' | 'cold') => Promise<void>;
  isLoading?: boolean;
  onViewDetails: () => void;
}

function LongPressPopup({
  // We don't use groupId and position in the component anymore
  isOpen,
  onClose,
  onColorSelect,
  onWhiteSelect,
  isLoading,
  onViewDetails
}: Omit<LongPressPopupProps, 'groupId' | 'position'>) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    // Try to find existing portal container
    let element = document.getElementById('popup-root');
    
    // If it doesn't exist, create it
    if (!element) {
      element = document.createElement('div');
      element.id = 'popup-root';
      document.body.appendChild(element);
    }
    
    setPortalElement(element);

    return () => {
      // Only remove if we created it
      if (element && !document.getElementById('popup-root')) {
        element.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalElement) return null;

  const popup = (
    <>
      {/* Dimmed background overlay - updated to match neumorphic design */}
      <div
        className="fixed inset-0 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed z-50 animate-in zoom-in-95 duration-200"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: 'var(--popup-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))',
          maxWidth: '280px',
          width: 'calc(100vw - 48px)'
        }}
      >
        <div className="rounded-3xl overflow-hidden" style={{
          background: '#EEF4FF',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
        }}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Controls</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  background: '#EEF4FF',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-3">
                  Color Controls
                </div>
                <ColorPicker
                  onColorSelect={(color) => {
                    return onColorSelect(color) as unknown as Promise<void>;
                  }}
                  onWhiteSelect={(type) => {
                    return onWhiteSelect(type) as unknown as Promise<void>;
                  }}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <button
                onClick={onViewDetails}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-blue-500 rounded-xl transition-colors"
                style={{
                  background: '#EEF4FF',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(popup, portalElement);
}

const baseUrl = 'http://192.168.18.4:3000/api';

export interface Light {
  id: string;
  name: string;
  type: string;
  isOn: boolean;
  isReachable: boolean;
}

export default function Switchboard({ isCreateOpen = false, onCreateClose = () => {} }: SwitchboardProps) {
  const [groups, setGroups] = useState<Group[]>([]); // Initialize with empty array
  // We still fetch lights data for potential future use, even though we don't display the count
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lights, setLights] = useState<Light[]>([]); // Initialize with empty array
  const [error, setError] = useState<string>('');
  const [lightStates, setLightStates] = useState<GroupLightState>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // This effect runs only on the client after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [activePopup, setActivePopup] = useState<{
    groupId: string;
    position: { x: number; y: number };
  } | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  
  // Handle long press start
  const handleTouchStart = (e: React.TouchEvent, groupId: string) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setActivePopup({
        groupId,
        position: { x: 0, y: 0 } // Position doesn't matter anymore as we center the popup
      });
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
  };
  
  // Handle touch end to clear timer
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  // Handle touch move to prevent accidental long press
  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
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

  const fetchLights = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/lights`);
      const data = await response.json();
      if (data.success) {
        setLights(data.data.lights);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch lights');
      console.error(err);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
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
  }, []);

  // Function to refresh both lights and groups data
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([fetchLights(), fetchGroups()]);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
      // Still update the refresh time even if there was an error
      setLastRefresh(new Date());
    }
  }, [fetchLights, fetchGroups]);

  // Initial data load - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshData();
    }
  }, [refreshData]);

  // Set up interval for refreshing data every minute - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const intervalId = setInterval(() => {
        refreshData();
      }, 60000); // 60000 ms = 1 minute

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [refreshData]);

  return (
    <div className="w-full min-h-screen p-2 sm:p-3 md:p-4 lg:p-6 bg-blue-50">
      {error && (
        <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 max-w-6xl mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="md-body-medium text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <CreateGroupPopup
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onGroupCreated={refreshData}
      />

      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Switchboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {groups?.length || 0} {(groups?.length || 0) === 1 ? 'group' : 'groups'} available
            </p>
            {isClient && (
              <p className="text-xs text-gray-400 mt-1">
                Last refreshed: {lastRefresh?.toLocaleTimeString() || 'Never'}
              </p>
            )}
          </div>
        </div>
        
        {/* Neumorphic grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {groups.map((group) => {
            const isOn = lightStates[group.id]?.isOn || false;
            const isLoading = lightStates[group.id]?.isLoading || false;
            
            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-3xl transition-all duration-300 hover:translate-y-[-2px]"
                onTouchStart={(e) => handleTouchStart(e, group.id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
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
                  onClick={() => toggleLights(group.id, !isOn)}
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
                        <span className="text-gray-400 ml-1">
                          ({group.bulbs.length})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* We've replaced the loading overlay with the circular progress bar around the power button */}
                </button>
                
                {/* Long press hint */}
                <div className="text-center py-1 text-[10px] text-gray-400 border-t border-gray-100">
                  Long press for options
                </div>
              </div>
            );
          })}
          
          {groups.length === 0 && (
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
                 onClick={onCreateClose}
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
         )}
        </div>
      </div>
      
      {/* Long press popup */}
      {activePopup && (
        <LongPressPopup
          isOpen={!!activePopup}
          onClose={() => setActivePopup(null)}
          onColorSelect={(color) => {
            return setColor(activePopup.groupId, color);
            // Don't close popup after color selection to allow multiple selections
          }}
          onWhiteSelect={(type) => {
            return setWhiteTemperature(activePopup.groupId, type);
            // Don't close popup after white selection to allow multiple selections
          }}
          isLoading={lightStates[activePopup.groupId]?.colorLoading}
          onViewDetails={() => {
            router.push(`/group/${activePopup.groupId}`);
            setActivePopup(null);
          }}
        />
      )}
    </div>
  );
}