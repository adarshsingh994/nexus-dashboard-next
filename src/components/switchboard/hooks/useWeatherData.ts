'use client';

import { useState, useEffect, useCallback } from 'react';
import { weatherApi } from '../weatherApi';

// Define weather data interface
export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: Date | null;
}

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Function to get location by IP address
  const getLocationByIP = useCallback(async () => {
    try {
      setUsingFallback(true);
      setLocationError('Using IP-based location (less accurate)');
      console.log('Attempting to get location by IP address...');
      
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error(`IP geolocation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('IP geolocation successful:', data.city);
      
      setCoords({
        lat: data.latitude,
        lon: data.longitude
      });
      
      return true;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      setLocationError('Could not determine your location. Using default location.');
      return false;
    }
  }, []);

  // Function to get user's current location
  const getUserLocation = useCallback(() => {
    // Check if we're in a secure context
    if (window.isSecureContext === false) {
      console.log('Not in a secure context, using IP geolocation fallback');
      getLocationByIP();
      return;
    }
    
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using IP geolocation fallback');
      getLocationByIP();
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLocationError('');
        setUsingFallback(false);
      },
      async (err) => {
        console.error('Error getting location:', err);
        setLocationError(`Unable to get precise location: ${err.message}`);
        
        // Fall back to IP-based geolocation
        console.log('Falling back to IP-based geolocation');
        await getLocationByIP();
      }
    );
  }, [getLocationByIP]);

  // Function to fetch weather data
  const fetchWeatherData = useCallback(async () => {
    if (locationError && !coords) {
      // If there was a location error and we don't have coords, try IP geolocation before falling back to default
      setIsLoading(true);
      
      // Try IP geolocation first if we haven't already
      if (!usingFallback) {
        const success = await getLocationByIP();
        if (success) {
          // If IP geolocation succeeded, the coords will be set and the next useEffect will trigger fetchWeatherData again
          return;
        }
      }
      
      // If IP geolocation failed or we're already using fallback, use default location
      try {
        const result = await weatherApi.fetchWeather();
        
        if (result.success) {
          setWeatherData({
            temperature: result.data.temperature,
            condition: result.data.condition,
            icon: result.data.icon,
            location: `${result.data.location} (Default)`,
            humidity: result.data.humidity,
            windSpeed: result.data.windSpeed,
            lastUpdated: new Date()
          });
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!coords) {
      // If we don't have coordinates yet, get them first
      getUserLocation();
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await weatherApi.fetchWeatherByCoords(coords.lat, coords.lon);
      
      if (result.success) {
        setWeatherData({
          temperature: result.data.temperature,
          condition: result.data.condition,
          icon: result.data.icon,
          location: usingFallback ? `${result.data.location} (Approximate)` : result.data.location,
          humidity: result.data.humidity,
          windSpeed: result.data.windSpeed,
          lastUpdated: new Date()
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  }, [coords, locationError, getUserLocation, getLocationByIP, usingFallback]);

  // Effect to fetch weather data when coordinates change
  useEffect(() => {
    if (coords) {
      fetchWeatherData();
    }
  }, [coords, fetchWeatherData]);

  // Initial location fetch when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getUserLocation();
    }
  }, [getUserLocation]);

  // Set up interval for refreshing data every 6 hours
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const intervalId = setInterval(() => {
        fetchWeatherData();
      }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [fetchWeatherData]);

  return {
    weatherData,
    isLoading,
    error: locationError || error,
    refreshWeatherData: fetchWeatherData,
    isUsingApproximateLocation: usingFallback
  };
}