'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ColorPicker from '../ColorPicker';

interface LongPressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: [number, number, number]) => Promise<void>;
  onWhiteSelect: (type: 'warm' | 'cold') => Promise<void>;
  isLoading?: boolean;
  onViewDetails: () => void;
}

export function LongPressPopup({
  isOpen,
  onClose,
  onColorSelect,
  onWhiteSelect,
  isLoading,
  onViewDetails
}: LongPressPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    // Try to find existing portal container
    let element = document.getElementById('popup-root');
    
    // If it doesn't exist, create it
    if (!element) {
      element = document.createElement('div');
      element.id = 'popup-root';
      document.body.appendChild(element);
    }
    
    setPortalElement(element);

    return () => {
      // Only remove if we created it
      if (element && !document.getElementById('popup-root')) {
        element.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalElement) return null;

  const popup = (
    <>
      {/* Dimmed background overlay - updated to match neumorphic design */}
      <div
        className="fixed inset-0 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed z-50 animate-in zoom-in-95 duration-200"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: 'var(--popup-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))',
          maxWidth: '280px',
          width: 'calc(100vw - 48px)'
        }}
      >
        <div className="rounded-3xl overflow-hidden" style={{
          background: '#EEF4FF',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
        }}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Controls</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  background: '#EEF4FF',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-3">
                  Color Controls
                </div>
                <ColorPicker
                  onColorSelect={(color) => {
                    return onColorSelect(color) as unknown as Promise<void>;
                  }}
                  onWhiteSelect={(type) => {
                    return onWhiteSelect(type) as unknown as Promise<void>;
                  }}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <button
                onClick={onViewDetails}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-blue-500 rounded-xl transition-colors"
                style={{
                  background: '#EEF4FF',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(popup, portalElement);
}