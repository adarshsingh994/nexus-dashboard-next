'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CreateGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

interface GroupFormData {
  id: string;
  name: string;
  description: string;
}

export default function CreateGroupPopup({ isOpen, onClose, onGroupCreated }: CreateGroupPopupProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    id: '',
    name: '',
    description: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    // Try to find existing portal container
    let element = document.getElementById('modal-root');
    
    // If it doesn't exist, create it
    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      document.body.appendChild(element);
    }
    
    setPortalElement(element);

    return () => {
      // Only remove if we created it
      if (element && !document.getElementById('modal-root')) {
        element.remove();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        onGroupCreated();
        onClose();
        setFormData({ id: '', name: '', description: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create group');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !portalElement) return null;

  const modal = (
    <div 
      className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md transform transition-all duration-200 scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md-card bg-surface dark:bg-gray-800/90 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="md-headline-medium text-gray-900 dark:text-white">Create New Group</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-6 md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                <div className="flex">
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
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="group-id" className="md-body-large text-gray-700 dark:text-gray-200 block mb-2">
                    Group ID
                  </label>
                  <input
                    id="group-id"
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-gray-900 dark:text-white md-body-large placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter a unique identifier"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="group-name" className="md-body-large text-gray-700 dark:text-gray-200 block mb-2">
                    Name
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-gray-900 dark:text-white md-body-large placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter a descriptive name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="group-description" className="md-body-large text-gray-700 dark:text-gray-200 block mb-2">
                    Description
                  </label>
                  <textarea
                    id="group-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-gray-900 dark:text-white md-body-large placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    rows={3}
                    placeholder="Describe the purpose of this group"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="md-button px-6 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="md-button md-button-primary px-6 py-2.5 relative overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalElement);
}