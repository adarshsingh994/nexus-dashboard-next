'use client';

import Switchboard from '../../components/Switchboard';
import { useState } from 'react';

export default function SwitchboardPage() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Switchboard
        isCreateOpen={isCreateGroupOpen}
        onCreateClose={() => setIsCreateGroupOpen(false)}
      />
    </div>
  );
}