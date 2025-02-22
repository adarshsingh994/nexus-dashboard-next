'use client';

import { useState, useEffect } from 'react';

interface DeviceState {
  colorTemp: null | number;
  rgb: number[];
  scene: null | string;
  isOn: boolean;
  brightness: number;
  warmWhite: number;
  coldWhite: number;
}

interface Device {
  ip: string;
  state: DeviceState;
  features: {
    brightness: boolean;
    color: boolean;
    color_tmp: boolean;
    effect: boolean;
  };
  kelvin_range: {
    max: number;
    min: number;
  };
  name: string;
  success: boolean;
}

interface DeviceDetailsProps {
  deviceIp: string;
  onBack: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function DeviceDetails({ deviceIp, onBack }: DeviceDetailsProps) {
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceDetails();
  }, [deviceIp]);

  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}/lights/${deviceIp}`);
      const data = await response.json();
      
      if (data.success) {
        setDevice(data.data.bulb);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch device details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 mx-4">
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
    );
  }

  if (!device) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <button
        onClick={onBack}
        className="md-button group flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-all"
      >
        <svg 
          className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="md-body-large">Back to Devices</span>
      </button>

      <div className="md-card bg-surface dark:bg-gray-800 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              device.state.isOn 
                ? 'bg-yellow-400/10 text-yellow-400' 
                : 'bg-gray-400/10 text-gray-400'
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
            </div>
            <h1 className="md-headline-large text-gray-900 dark:text-white">{device.name}</h1>
          </div>

          <div className="grid gap-8">
            <section>
              <h2 className="md-headline-small text-gray-900 dark:text-white mb-4">Device Information</h2>
              <div className="md-card bg-gray-50 dark:bg-gray-700/50 p-6">
                <div className="grid gap-4">
                  <div className="flex items-center">
                    <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">IP Address</span>
                    <span className="md-body-large text-gray-900 dark:text-white font-mono">{device.ip}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Status</span>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        device.state.isOn 
                          ? 'bg-green-500 shadow-lg shadow-green-500/20' 
                          : 'bg-gray-400'
                      }`}></div>
                      <span className="md-body-large text-gray-900 dark:text-white">
                        {device.state.isOn ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Brightness</span>
                    <span className="md-body-large text-gray-900 dark:text-white">{device.state.brightness}%</span>
                  </div>
                  {device.state.colorTemp !== null && (
                    <div className="flex items-center">
                      <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Color Temperature</span>
                      <span className="md-body-large text-gray-900 dark:text-white">{device.state.colorTemp}K</span>
                    </div>
                  )}
                  {device.state.rgb && (
                    <div className="flex items-center">
                      <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">RGB Color</span>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full shadow-md" 
                          style={{ backgroundColor: `rgb(${device.state.rgb.join(', ')})` }}
                        />
                        <span className="md-body-large text-gray-900 dark:text-white font-mono">
                          rgb({device.state.rgb.join(', ')})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="md-headline-small text-gray-900 dark:text-white mb-4">Features</h2>
              <div className="md-card bg-gray-50 dark:bg-gray-700/50 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(device.features).map(([feature, supported]) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        supported 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {supported ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                      </div>
                      <span className="md-body-large text-gray-900 dark:text-white capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {device.kelvin_range && (
              <section>
                <h2 className="md-headline-small text-gray-900 dark:text-white mb-4">Color Temperature Range</h2>
                <div className="md-card bg-gray-50 dark:bg-gray-700/50 p-6">
                  <div className="grid gap-4">
                    <div className="flex items-center">
                      <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Minimum</span>
                      <span className="md-body-large text-gray-900 dark:text-white">{device.kelvin_range.min}K</span>
                    </div>
                    <div className="flex items-center">
                      <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Maximum</span>
                      <span className="md-body-large text-gray-900 dark:text-white">{device.kelvin_range.max}K</span>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}