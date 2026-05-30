import api from './axios';
import type { DashboardStats, AttendanceLog } from '../types';

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
  
  getRecentActivity: (limit = 10) =>
    api.get<AttendanceLog[]>(`/dashboard/recent-activity?limit=${limit}`),
};
