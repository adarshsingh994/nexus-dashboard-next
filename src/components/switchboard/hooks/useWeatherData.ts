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

  // Function to get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
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
      },
      (err) => {
        console.error('Error getting location:', err);
        setLocationError(`Unable to get your location: ${err.message}`);
        setIsLoading(false);
      }
    );
  }, []);

  // Function to fetch weather data
  const fetchWeatherData = useCallback(async () => {
    if (locationError && !coords) {
      // If there was a location error and we don't have coords, fall back to default location
      setIsLoading(true);
      try {
        const result = await weatherApi.fetchWeather();
        
        if (result.success) {
          setWeatherData({
            temperature: result.data.temperature,
            condition: result.data.condition,
            icon: result.data.icon,
            location: result.data.location,
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
          location: result.data.location,
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
  }, [coords, locationError, getUserLocation]);

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
    refreshWeatherData: fetchWeatherData
  };
}