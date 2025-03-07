'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateGroupPopup from '../CreateGroupPopup';
import { useLightControl } from './hooks/useLightControl';
import { useDataFetching } from './hooks/useDataFetching';
import { useLongPress } from './hooks/useLongPress';
import { GroupCard } from './GroupCard';
import { EmptyState } from './EmptyState';
import { LongPressPopup } from './LongPressPopup';
import { SwitchboardProps } from './types';

export default function Switchboard({ 
  isCreateOpen = false, 
  onCreateClose = () => {} 
}: SwitchboardProps) {
  const router = useRouter();
  
  // Use our custom hooks
  const {
    groups,
    // We still fetch lights data for potential future use, even though we don't display the count
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lights,
    error,
    lastRefresh,
    isClient,
    refreshData
  } = useDataFetching();
  
  const {
    lightStates,
    setLightStates,
    toggleLights,
    setColor,
    setWhiteTemperature
  } = useLightControl();
  
  const {
    activePopup,
    setActivePopup,
    handleTouchStart,
    // These handlers are used in the GroupCard component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleTouchEnd,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleTouchMove
  } = useLongPress();

  // Initial data load - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchData = async () => {
        const initialLightStates = await refreshData();
        setLightStates(initialLightStates);
      };
      
      fetchData();
    }
  }, [refreshData, setLightStates]);

  // Set up interval for refreshing data every minute - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const intervalId = setInterval(() => {
        refreshData().then(initialLightStates => {
          setLightStates(prev => ({
            ...prev,
            ...initialLightStates
          }));
        });
      }, 60000); // 60000 ms = 1 minute

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [refreshData, setLightStates]);

  return (
    <div className="w-full min-h-screen p-2 sm:p-3 md:p-4 lg:p-6 bg-blue-50 dark:bg-gray-800">
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Switchboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {groups?.length || 0} {(groups?.length || 0) === 1 ? 'group' : 'groups'} available
      </p>
      {isClient && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Last refreshed: {lastRefresh?.toLocaleTimeString() || 'Never'}
        </p>
      )}
    </div>
  </div>
  
  {/* Neumorphic grid layout */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              lightState={lightStates[group.id] || { isOn: false, isLoading: false }}
              onToggleLights={toggleLights}
              handleTouchStart={handleTouchStart}
              handleTouchEnd={handleTouchEnd}
              handleTouchMove={handleTouchMove}
            />
          ))}
          
          {groups.length === 0 && (
            <EmptyState onCreateGroup={onCreateClose} />
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

// Export all components and hooks for easier imports
export * from './types';
export * from './GroupCard';
export * from './EmptyState';
export * from './LongPressPopup';
export * from './WeatherCard';
export * from './hooks/useLightControl';
export * from './hooks/useLongPress';
export * from './hooks/useDataFetching';
export * from './hooks/useWeatherData';