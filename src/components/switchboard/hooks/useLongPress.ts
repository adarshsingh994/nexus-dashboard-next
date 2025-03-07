'use client';

import { useState, useCallback } from 'react';

export function useLongPress() {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [activePopup, setActivePopup] = useState<{
    groupId: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, groupId: string) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setActivePopup({
        groupId,
        position: { x: 0, y: 0 } // Position doesn't matter anymore as we center the popup
      });
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);
  
  const handleTouchMove = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return {
    activePopup,
    setActivePopup,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove
  };
}