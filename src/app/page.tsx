'use client';

import GroupManager from '@/components/GroupManager';
import DeviceManager from '@/components/DeviceManager';
import Navbar from '@/components/Navbar';
import { useState, useRef } from 'react';

export default function Home() {
  const [deviceCount, setDeviceCount] = useState(0);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const deviceManagerRef = useRef<{ fetchDevices: () => Promise<void> }>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onRefreshDevices={() => deviceManagerRef.current?.fetchDevices()} 
        onCreateGroup={() => setIsCreateGroupOpen(true)}
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="md-headline-large text-gray-900 dark:text-white">
          {deviceCount} {deviceCount === 1 ? 'device' : 'devices'} available
        </h1>
        <DeviceManager
          ref={deviceManagerRef}
          onDeviceCountChange={setDeviceCount}
        />
        <GroupManager 
          isCreateOpen={isCreateGroupOpen}
          onCreateClose={() => setIsCreateGroupOpen(false)}
        />
      </div>
    </div>
  );
}
