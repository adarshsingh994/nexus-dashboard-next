'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

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

interface DeviceResponse {
  message: string;
  success: boolean;
  data: {
    count: number;
    bulbs: Device[];
  };
}

interface DeviceManagerProps {
  onDeviceCountChange?: (count: number) => void;
}

interface DeviceManagerHandle {
  fetchDevices: () => Promise<void>;
}

const baseUrl = 'http://192.168.18.4:3000/api';

const DeviceManager = forwardRef<DeviceManagerHandle, DeviceManagerProps>(
  ({ onDeviceCountChange }, ref) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const fetchDevices = async () => {
      try {
        setError('');
        const response = await fetch(`${baseUrl}/lights?grouped=false`);
        const data = await response.json() as DeviceResponse;
        
        if (!data.success || !data.data?.bulbs) {
          const errorMsg = data.message || 'Invalid device response';
          console.error('Device response error:', errorMsg);
          setError(errorMsg);
          return;
        }

        const bulbs = data.data.bulbs;
        setDevices(bulbs);
        onDeviceCountChange?.(bulbs.length);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch devices';
        console.error('Device fetch error:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchDevices
    }));

    useEffect(() => {
      fetchDevices();
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="md-card bg-surface dark:bg-gray-800/50 overflow-hidden">
        {error && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
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
          </div>
        )}

        <div className="p-6">
          <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-lg mb-6">
            <h2 className="md-body-large text-gray-700 dark:text-gray-300">
              {devices.length} devices available
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {devices.map((device) => (
              <div
                key={device.ip}
                draggable
                onDragStart={(e) => {
                  const deviceData = {
                    type: 'bulb',
                    id: device.ip.trim()
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(deviceData));
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const element = e.currentTarget;
                  const rect = element.getBoundingClientRect();
                  
                  element.dataset.touchOffsetX = String(touch.clientX - rect.left);
                  element.dataset.touchOffsetY = String(touch.clientY - rect.top);
                  
                  const deviceData = {
                    type: 'bulb',
                    id: device.ip.trim()
                  };
                  element.dataset.deviceData = JSON.stringify(deviceData);
                }}
                className="md-card group overflow-hidden cursor-move hover:shadow-elevation-3 transition-all duration-material"
              >
                <div className="p-4 flex flex-col h-full text-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                      device.state.isOn
                        ? 'bg-yellow-400/10 text-yellow-400 group-hover:scale-110'
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
                    <h3 className="md-body-large text-gray-900 dark:text-white truncate max-w-full">{device.name}</h3>
                  </div>
  
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      device.state.isOn
                        ? 'bg-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-gray-400'
                    }`}></div>
                    <span className="md-body-small text-gray-600 dark:text-gray-300">
                      {device.state.isOn ? 'On' : 'Off'}
                    </span>
                  </div>
  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="md-body-small text-gray-400 dark:text-gray-500 font-mono truncate" title={device.ip}>
                      {device.ip}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {devices.length === 0 && (
              <div className="col-span-full">
                <div className="md-card p-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <h3 className="md-headline-small text-gray-900 dark:text-white mb-2">No devices found</h3>
                  <p className="md-body-large text-gray-500 dark:text-gray-400">
                    Click refresh to scan for devices
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DeviceManager.displayName = 'DeviceManager';

export default DeviceManager;