import api from './axios';
import type { AttendanceLog } from '../types';
import type { PageResponse } from './customers';

export interface AttendanceLogRequest {
  date: string;
  customerId: string;
  meal: 'Lunch' | 'Dinner' | 'Both';
  action: 'Skipped' | 'Resumed' | 'Paused';
  source: 'Bot' | 'Manual';
}

export const attendanceApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PageResponse<AttendanceLog>>(`/attendance?page=${page}&size=${size}`),
  
  getByCustomer: (customerId: string) =>
    api.get<AttendanceLog[]>(`/attendance/customer/${customerId}`),
  
  logAttendance: (data: AttendanceLogRequest) =>
    api.post<AttendanceLog>('/attendance', data),
  
  countSkippedToday: () =>
    api.get<number>('/attendance/today/skipped'),
  
  countAttendedToday: () =>
    api.get<number>('/attendance/today/attended'),
};
