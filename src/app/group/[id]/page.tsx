'use client';

import { useParams } from 'next/navigation';
import GroupDetails from '@/components/GroupDetails';

export default function GroupPage() {
  const params = useParams();
  const groupId = params.id as string;

  return <GroupDetails groupId={groupId} />;
}