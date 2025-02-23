'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Bulb {
  ip: string;
  name: string;
  state: {
    isOn: boolean;
    brightness: number;
    rgb: [number, number, number];
  };
  features: {
    brightness: boolean;
    color: boolean;
    color_tmp: boolean;
    effect: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  parentGroups: string[];
  childGroups: string[];
  bulbs: string[];
}

interface GroupDetailsProps {
  groupId: string;
  onBack?: () => void;
}

const baseUrl = 'http://192.168.18.4:3000/api';

export default function GroupDetails({ groupId, onBack }: GroupDetailsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const router = useRouter();

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}`);
      const data = await response.json();
      
      if (data.success) {
        setGroup(data.data.group);
        setBulbs(data.data.bulbs);
        setEditForm({ name: data.data.group.name, description: data.data.group.description });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch group details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGroup(data.data);
        setIsEditing(false);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update group');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete group');
      console.error(err);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 mx-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="md-body-large text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <button
        onClick={handleBack}
        className="md-button group flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-all"
      >
        <svg 
          className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="md-body-large">Back to Groups</span>
      </button>

      <div className="md-card p-8 space-y-8">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="name" className="block md-body-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full md-input"
                />
              </div>
              <div>
                <label htmlFor="description" className="block md-body-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full md-input min-h-[100px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-primary bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:border-primary-light dark:hover:bg-primary-dark transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="md-headline-large text-gray-900 dark:text-white">{group.name}</h1>
                <p className="md-body-large text-gray-600 dark:text-gray-300">{group.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:border-red-800/30 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1.5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="md-headline-small text-gray-900 dark:text-white mb-4">Group Information</h2>
            <div className="md-card bg-gray-50 dark:bg-gray-800 p-6 space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center">
                  <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">ID</span>
                  <span className="md-body-large text-gray-900 dark:text-white font-mono">{group.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Parent Groups</span>
                  <div className="flex flex-wrap gap-2">
                    {group.parentGroups.length > 0 ? (
                      group.parentGroups.map(parent => (
                        <span key={parent} className="md-chip">{parent}</span>
                      ))
                    ) : (
                      <span className="md-body-medium text-gray-500 dark:text-gray-400">None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="md-body-large text-gray-500 dark:text-gray-400 w-36">Child Groups</span>
                  <div className="flex flex-wrap gap-2">
                    {group.childGroups.length > 0 ? (
                      group.childGroups.map(child => (
                        <span key={child} className="md-chip">{child}</span>
                      ))
                    ) : (
                      <span className="md-body-medium text-gray-500 dark:text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="md-headline-small text-gray-900 dark:text-white mb-4">Connected Bulbs</h2>
            {bulbs.length > 0 ? (
              <div className="grid gap-4">
                {bulbs.map((bulb) => (
                  <div 
                    key={bulb.ip} 
                    className="md-card bg-gray-50 dark:bg-gray-800 p-6 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="md-body-large font-medium text-gray-900 dark:text-white">{bulb.name}</h3>
                        <p className="md-body-medium text-gray-500 dark:text-gray-400 font-mono">{bulb.ip}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center">
                          <div 
                            className={`w-4 h-4 rounded-full mr-2 transition-colors ${
                              bulb.state.isOn 
                                ? 'bg-green-500 shadow-lg shadow-green-500/20' 
                                : 'bg-gray-400'
                            }`}
                          />
                          <span className="md-body-medium text-gray-700 dark:text-gray-300">
                            {bulb.state.isOn ? 'On' : 'Off'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg 
                            className="w-4 h-4 text-yellow-500 mr-2" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                          </svg>
                          <span className="md-body-medium text-gray-700 dark:text-gray-300">
                            {bulb.state.brightness}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="md-card bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <p className="md-body-large text-gray-500 dark:text-gray-400">
                  No bulbs connected to this group
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}