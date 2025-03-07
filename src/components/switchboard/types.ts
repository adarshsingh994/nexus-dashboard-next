'use client';

export interface Group {
  id: string;
  name: string;
  description: string;
  parentGroups: string[];
  childGroups: string[];
  bulbs: string[];
  isOn: boolean;
}

export interface GroupLightState {
  [groupId: string]: {
    isOn: boolean;
    isLoading: boolean;
    colorLoading?: boolean;
  };
}

export interface SwitchboardProps {
  isCreateOpen?: boolean;
  onCreateClose?: () => void;
}

export interface LongPressPopupProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onColorSelect: (color: [number, number, number]) => Promise<void>;
  onWhiteSelect: (type: 'warm' | 'cold') => Promise<void>;
  isLoading?: boolean;
  onViewDetails: () => void;
}

export interface Light {
  id: string;
  name: string;
  type: string;
  isOn: boolean;
  isReachable: boolean;
}

export interface GroupCardProps {
  group: Group;
  lightState: {
    isOn: boolean;
    isLoading: boolean;
  };
  onToggleLights: (groupId: string, turnOn: boolean) => Promise<void>;
  onLongPress?: (groupId: string) => void;
  handleTouchStart: (e: React.TouchEvent, groupId: string) => void;
  handleTouchEnd: () => void;
  handleTouchMove: () => void;
}