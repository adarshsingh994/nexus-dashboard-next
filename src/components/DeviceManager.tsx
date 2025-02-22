'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import DeviceDetails from './DeviceDetails';

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
    const [selectedDeviceIp, setSelectedDeviceIp] = useState<string | null>(null);

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
      }
    };

    useImperativeHandle(ref, () => ({
      fetchDevices
    }));

    useEffect(() => {
      fetchDevices();
    }, []);

    useEffect(() => {
      const handleDeviceAddedToGroup = () => {
        fetchDevices();
      };

      window.addEventListener('deviceAddedToGroup', handleDeviceAddedToGroup);
      return () => {
        window.removeEventListener('deviceAddedToGroup', handleDeviceAddedToGroup);
      };
    }, []);

    if (selectedDeviceIp) {
      return (
        <DeviceDetails
          deviceIp={selectedDeviceIp}
          onBack={() => setSelectedDeviceIp(null)}
        />
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-center cursor-move">
            <div className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{devices.length} devices available</h2>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {devices.map((device) => (
              <div
                key={device.ip}
                onClick={() => setSelectedDeviceIp(device.ip)}
                draggable
                onDragStart={(e) => {
                  const deviceData = {
                    type: 'bulb',
                    id: device.ip.trim()
                  };
                  console.log('Setting drag data:', deviceData);
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
                  console.log('Setting touch data:', deviceData);
                  element.dataset.deviceData = JSON.stringify(deviceData);
                }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow aspect-square cursor-move flex flex-col items-center justify-center text-center relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-12 h-12 mb-3 ${device.state.isOn ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
                <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1">{device.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Status: {device.state.isOn ? 'On' : 'Off'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  IP: {device.ip}
                </p>
              </div>
            ))}

            {devices.length === 0 && (
              <div className="col-span-full">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No devices found</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">Click refresh to scan for devices</p>
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