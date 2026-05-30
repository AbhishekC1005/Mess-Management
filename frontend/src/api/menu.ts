import api from './axios';
import type { DailyMenu } from '../types';

export interface DailyMenuRequest {
  date: string;
  lunchMenu: string | null;
  dinnerMenu: string | null;
}

export const menuApi = {
  getMenu: (date?: string) =>
    api.get<DailyMenu>(`/menu${date ? `?date=${date}` : ''}`),
  saveMenu: (data: DailyMenuRequest) =>
    api.put<DailyMenu>('/menu', data),
};
