'use client';

import { useEffect, useState } from 'react';
import { WeatherData } from './hooks/useWeatherData';

interface WeatherCardProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
}

export function WeatherCard({ 
  weatherData, 
  isLoading, 
  error, 
  onRefresh 
}: WeatherCardProps) {
  const [timeString, setTimeString] = useState<string>('');

  // Update the time string every minute
  useEffect(() => {
    const updateTimeString = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateTimeString();
    const intervalId = setInterval(updateTimeString, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-3xl transition-all duration-300 hover:translate-y-[-2px] bg-blue-50 dark:bg-gray-800"
      style={{
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Card header */}
      <div className="px-3 py-3 bg-blue-100 dark:bg-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Weather</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{timeString}</span>
        </div>
      </div>
      
      {/* Weather content */}
      <div className="px-3 py-4 dark:text-gray-200">
        {error && (
          <div className="text-center text-red-400 dark:text-red-300 text-sm py-2 bg-red-50 dark:bg-red-900/20 rounded-lg mx-2">
            {error}
          </div>
        )}
        
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 rounded-full relative">
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10"
                viewBox="0 0 100 100"
              >
                <circle
                  className="text-blue-100 dark:text-blue-900/30"
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
                  className="text-blue-500 dark:text-blue-400 transition-all duration-300"
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
            </div>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">
              {error.includes('location') ? 'Getting your location...' : 'Loading weather data...'}
            </p>
            {error.includes('location') && (
              <p className="text-xs text-blue-400 dark:text-blue-300 mt-1 text-center">
                Please allow location access for local weather
              </p>
            )}
          </div>
        )}
        
        {weatherData && (
          <div className="flex flex-col items-center">
            {/* Weather icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-blue-50 dark:bg-gray-700"
              style={{
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                alt={weatherData.condition}
                className="w-12 h-12"
              />
            </div>
            
            {/* Temperature */}
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {weatherData.temperature}°C
            </div>
            
            {/* Condition */}
            <div className="text-sm text-blue-600 dark:text-blue-300 capitalize mb-3">
              {weatherData.condition}
            </div>
            
            {/* Location with indicator */}
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {weatherData.location}
            </div>
            
            {/* Additional details */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>Humidity: {weatherData.humidity}%</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Wind: {weatherData.windSpeed} m/s</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 bg-blue-100 dark:bg-gray-700"
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {isLoading
          ? (error.includes('location') ? 'Getting location...' : 'Refreshing...')
          : 'Last updated: ' + (weatherData?.lastUpdated ? new Date(weatherData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never')}
      </button>
    </div>
  );
}