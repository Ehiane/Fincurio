import { apiClient } from './client';
import type { OtherDeductionItem } from './income.api';

export interface UserPreferences {
  currency: string;
  timezone: string;
  monthlyBudgetGoal?: number;
}

export interface IncomeProfileData {
  employmentType: string;
  earningMethod: string;
  payFrequency: string;
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  stateTaxCode?: string;
  estimatedFederalTax: number;
  estimatedStateTax: number;
  // v2 user-input fields
  healthInsurancePerPaycheck: number;
  retirementPercent: number;
  otherDeductionItems: OtherDeductionItem[];
  // Computed annual fields
  healthInsurance: number;
  retirementContribution: number;
  totalOtherDeductions: number;
  grossAnnualIncome: number;
  netAnnualIncome: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  financialIntention?: string;
  isEmailVerified: boolean;
  preferences?: UserPreferences;
  incomeProfile?: IncomeProfileData;
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
