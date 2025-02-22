'use client';

import GroupManager from '@/components/GroupManager';
import DeviceManager from '@/components/DeviceManager';
import Navbar from '@/components/Navbar';
import { useState, useRef } from 'react';

export default function Home() {
  const [deviceCount, setDeviceCount] = useState(0);
  const deviceManagerRef = useRef<{ fetchDevices: () => Promise<void> }>(null);

  return (
    <>
      <Navbar onRefreshDevices={() => deviceManagerRef.current?.fetchDevices()} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {deviceCount} {deviceCount === 1 ? 'device' : 'devices'} available
        </h1>
        <DeviceManager
          ref={deviceManagerRef}
          onDeviceCountChange={setDeviceCount}
        />
        <GroupManager />
      </div>
    </>
  );
}
