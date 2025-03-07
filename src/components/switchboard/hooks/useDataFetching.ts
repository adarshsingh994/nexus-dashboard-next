'use client';

import { useState, useEffect, useCallback } from 'react';
import { Group, Light, GroupLightState } from '../types';
import { api } from '../api';

export function useDataFetching() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [lights, setLights] = useState<Light[]>([]);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchLights = useCallback(async () => {
    try {
      const data = await api.fetchLights();
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
      const data = await api.fetchGroups();
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
        return initialLightStates;
      } else {
        setError(data.message);
        return {};
      }
    } catch (err) {
      setError('Failed to fetch groups');
      console.error(err);
      return {};
    }
  }, []);

  // Function to refresh both lights and groups data
  const refreshData = useCallback(async () => {
    try {
      // Using Promise.all to fetch both lights and groups in parallel
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [lightsResult, initialLightStates] = await Promise.all([
        fetchLights(),
        fetchGroups()
      ]);
      setLastRefresh(new Date());
      return initialLightStates;
    } catch (err) {
      console.error('Error refreshing data:', err);
      // Still update the refresh time even if there was an error
      setLastRefresh(new Date());
      return {};
    }
  }, [fetchLights, fetchGroups]);

  return {
    groups,
    lights,
    error,
    lastRefresh,
    isClient,
    refreshData
  };
}