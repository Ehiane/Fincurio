import { apiClient } from './client';

export interface GoalCategory {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  type: 'budget' | 'savings';
  targetAmount: number;
  categoryId?: string;
  category?: GoalCategory;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  deadline?: string;
  startDate: string;
  isActive: boolean;
  currentAmount: number;
  remainingAmount: number;
  percentComplete: number;
  isOnTrack: boolean;
  periodLabel?: string;
}

export interface GoalSummary {
  totalGoals: number;
  activeBudgetGoals: number;
  activeSavingsGoals: number;
  onTrackCount: number;
  offTrackCount: number;
}

export interface GoalListResponse {
  goals: Goal[];
  summary: GoalSummary;
}

export interface CreateGoalRequest {
  name: string;
  type: 'budget' | 'savings';
  targetAmount: number;
  categoryId?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  deadline?: string;
  startDate?: string;
}

export const goalsApi = {
  getAll: async (): Promise<GoalListResponse> => {
    const response = await apiClient.get('/api/goals');
    return response.data;
  },

  getById: async (id: string): Promise<Goal> => {
    const response = await apiClient.get(`/api/goals/${id}`);
    return response.data;
  },

  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post('/api/goals', data);
    return response.data;
  },

  update: async (id: string, data: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.put(`/api/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/goals/${id}`);
  },
};
