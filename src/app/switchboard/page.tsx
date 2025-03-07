'use client';

import Switchboard from '../../components/Switchboard';
import { useState } from 'react';
import { WeatherCard } from '../../components/switchboard/WeatherCard';
import { useWeatherData } from '../../components/switchboard/hooks/useWeatherData';

export default function SwitchboardPage() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { weatherData, isLoading, error, refreshWeatherData, isUsingApproximateLocation } = useWeatherData();

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="mb-4">
          <WeatherCard
            weatherData={weatherData}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshWeatherData}
            isUsingApproximateLocation={isUsingApproximateLocation}
          />
        </div>
      </div>
      <Switchboard
        isCreateOpen={isCreateGroupOpen}
        onCreateClose={() => setIsCreateGroupOpen(false)}
      />
    </div>
  );
}