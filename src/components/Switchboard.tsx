'use client';

import { useState, useEffect, useRef } from 'react';
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
      {/* Dimmed background overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 animate-in fade-in duration-200 z-40"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Controls</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              
              <button
                onClick={onViewDetails}
                className="w-full py-2 px-3 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">View Details</span>
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

export default function Switchboard({ isCreateOpen = false, onCreateClose = () => {} }: SwitchboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');
  const [lightStates, setLightStates] = useState<GroupLightState>({});
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
        onGroupCreated={fetchGroups}
      />

      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md-headline-medium text-gray-900 dark:text-white">Switchboard</h1>
            <p className="md-body-small text-gray-500 dark:text-gray-400 mt-1">
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
            </p>
          </div>
        </div>
        
        {/* Material Design grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {groups.map((group) => {
            const isOn = lightStates[group.id]?.isOn || false;
            const isLoading = lightStates[group.id]?.isLoading || false;
            
            return (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-gray-900/30 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all duration-300"
                onTouchStart={(e) => handleTouchStart(e, group.id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                data-group-id={group.id}
              >
                {/* Card header - simplified */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{group.name}</h3>
                </div>
                
                {/* Power button - more minimal */}
                <button
                  onClick={() => toggleLights(group.id, !isOn)}
                  disabled={isLoading}
                  className={`
                    w-full px-3 py-4 flex items-center justify-center relative overflow-hidden
                    ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                    transition-all duration-300
                    ${isOn
                      ? 'bg-primary/5 dark:bg-primary/10'
                      : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                  `}
                  style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  aria-pressed={isOn}
                  aria-label={`Toggle ${group.name} lights`}
                >
                  <div className="flex flex-col items-center relative z-10">
                    {/* Power icon - simplified */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2
                        ${isOn
                          ? 'bg-primary text-white dark:text-gray-100'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                        transition-all duration-300
                      `}
                      style={{
                        boxShadow: isOn
                          ? '0 2px 8px rgba(var(--primary-rgb), 0.3)'
                          : '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    
                    {/* Status text - simplified */}
                    <div className="text-xs font-medium">
                      <span className={`${isOn ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                        {isOn ? 'ON' : 'OFF'}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                        ({group.bulbs.length})
                      </span>
                    </div>
                  </div>
                  
                  {/* Loading overlay - simplified */}
                  {isLoading && (
                    <div
                      className="absolute inset-0 flex items-center justify-center z-20 bg-white/70 dark:bg-gray-900/70"
                      style={{ backdropFilter: 'blur(2px)' }}
                    >
                      <svg
                        className="animate-spin h-8 w-8 text-primary dark:text-primary-light"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </button>
                
                {/* Long press hint - subtle indicator */}
                <div className="text-center py-1 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                  Long press for options
                </div>
              </div>
            );
          })}
          
          {groups.length === 0 && (
           <div className="col-span-full">
             <div className="p-6 flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30">
               <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                 No groups yet
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                 Create your first group to start controlling your lights
               </p>
               <button
                 onClick={onCreateClose}
                 className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-white dark:text-gray-100 bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary-darker rounded-full"
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