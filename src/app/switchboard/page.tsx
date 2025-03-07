'use client';

import Switchboard from '../../components/Switchboard';
import { useState, useEffect } from 'react';
import { WeatherCard } from '../../components/switchboard/WeatherCard';
import { useWeatherData } from '../../components/switchboard/hooks/useWeatherData';
import 'ui-neumorphism/dist/index.css';

export default function SwitchboardPage() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { weatherData, isLoading, error, refreshWeatherData, isUsingApproximateLocation } = useWeatherData();

  // Detect dark mode
  useEffect(() => {
    // Check if dark mode is enabled
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Define neumorphic styles based on dark/light mode
  const pageBackgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#EEF0F4',
    minHeight: '100vh',
    width: '100%',
    padding: '1rem'
  };

  const neumorphicCardStyle = {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#EEF0F4',
    borderRadius: '1.5rem',
    boxShadow: isDarkMode
      ? '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)'
      : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
    overflow: 'hidden',
    marginBottom: '1.5rem'
  };

  return (
    <div style={pageBackgroundStyle}>
      <div className="max-w-6xl mx-auto">
        {/* Weather Card - styled like a group card */}
        <div className="mb-6">
          <div style={neumorphicCardStyle}>
            <WeatherCard
              weatherData={weatherData}
              isLoading={isLoading}
              error={error}
              onRefresh={refreshWeatherData}
              isUsingApproximateLocation={isUsingApproximateLocation}
            />
          </div>
        </div>
        
        {/* Switchboard */}
        <Switchboard
          isCreateOpen={isCreateGroupOpen}
          onCreateClose={() => setIsCreateGroupOpen(false)}
        />
      </div>
    </div>
  );
}