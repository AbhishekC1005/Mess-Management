export type MealPlan = 'Lunch' | 'Dinner' | 'Both';
export type CustomerStatus = 'Active' | 'Paused' | 'Inactive';
export type ActionType = 'Skipped' | 'Resumed' | 'Paused' | 'Present';
export type SourceType = 'Bot' | 'Manual' | 'System';

export interface PauseHistory {
  id: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  plan: MealPlan;
  status: CustomerStatus;
  mealsUsed: number;
  totalMeals: number;
  amountDue: number;
  joinDate: string;
  skippedCount: number;
  phone?: string;
  telegramChatId?: number;
  pauseHistory: PauseHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLog {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  meal: MealPlan;
  action: ActionType;
  source: SourceType;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  mealsToday: number;
  skippedToday: number;
  pausedCustomers: number;
}

export interface MessSettings {
  id: string;
  lunchCutoffTime: string;
  dinnerCutoffTime: string;
  autoMarkEnabled: boolean;
  timezone: string;
  updatedAt: string;
}

export interface DailyMenu {
  id?: string;
  date: string;
  lunchMenu: string | null;
  dinnerMenu: string | null;
  createdAt?: string;
  updatedAt?: string;
}
