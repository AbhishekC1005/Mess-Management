import api from './axios';
import type { MessSettings } from '../types';

export const settingsApi = {
  get: () => api.get<MessSettings>('/settings'),
  update: (data: {
    lunchCutoffTime: string;
    dinnerCutoffTime: string;
    autoMarkEnabled: boolean;
    timezone: string;
  }) => api.put<MessSettings>('/settings', data),
};
