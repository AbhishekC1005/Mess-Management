import api from './axios';
import type { Customer } from '../types';

export interface CustomerRequest {
  name: string;
  plan: 'Lunch' | 'Dinner' | 'Both';
  status: 'Active' | 'Paused' | 'Inactive';
  totalMeals: number;
  amountDue: number;
  joinDate: string;
  phone?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const customersApi = {
  getAll: (page = 0, size = 10) =>
    api.get<PageResponse<Customer>>(`/customers?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    api.get<Customer>(`/customers/${id}`),
  
  create: (data: CustomerRequest) =>
    api.post<Customer>('/customers', data),
  
  update: (id: string, data: CustomerRequest) =>
    api.put<Customer>(`/customers/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/customers/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch<Customer>(`/customers/${id}/status?status=${status}`),
  
  pause: (id: string, endDate?: string) =>
    api.post<Customer>(`/customers/${id}/pause?${endDate ? `endDate=${endDate}` : ''}`),
  
  resume: (id: string) =>
    api.post<Customer>(`/customers/${id}/resume`),
  
  countByStatus: (status: string) =>
    api.get<number>(`/customers/count-by-status?status=${status}`),
};
