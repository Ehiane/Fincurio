import { apiClient } from './client';

export interface UserPreferences {
  currency: string;
  timezone: string;
  monthlyBudgetGoal?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  financialIntention?: string;
  preferences?: UserPreferences;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  financialIntention?: string;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  timezone?: string;
  monthlyBudgetGoal?: number;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put('/api/user/profile', data);
    return response.data;
  },

  updatePreferences: async (data: UpdatePreferencesRequest): Promise<void> => {
    await apiClient.put('/api/user/preferences', data);
  },
};
