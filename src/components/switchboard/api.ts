'use client';

// We'll use these types in the future when we add type checking for responses
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Group, Light } from './types';

const baseUrl = 'http://192.168.18.4:3000/api';

export const api = {
  async toggleLights(groupId: string, turnOn: boolean) {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: turnOn ? 'turnOn' : 'turnOff'
        })
      });

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to control lights';
      throw new Error(errorMessage);
    }
  },

  async setColor(groupId: string, color: [number, number, number]) {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setColor',
          params: {
            color: color
          }
        })
      });

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set color';
      throw new Error(errorMessage);
    }
  },

  async setWhiteTemperature(groupId: string, type: 'warm' | 'cold') {
    try {
      const response = await fetch(`${baseUrl}/groups/${groupId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: type === 'warm' ? 'setWarmWhite' : 'setColdWhite',
          params: {
            intensity: 255
          }
        })
      });

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to set ${type} white`;
      throw new Error(errorMessage);
    }
  },

  async fetchLights() {
    try {
      const response = await fetch(`${baseUrl}/lights`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch lights');
    }
  },

  async fetchGroups() {
    try {
      const response = await fetch(`${baseUrl}/groups`);
      return await response.json();
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch groups');
    }
  }
};