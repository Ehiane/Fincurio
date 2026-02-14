import { apiClient } from './client';

// --- Types ---

export interface OtherDeductionItem {
  name: string;
  amountPerPaycheck: number;
}

export interface CreateIncomeProfileRequest {
  employmentType: string;
  earningMethod: string;
  payFrequency: string;
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  stateTaxCode?: string;
  healthInsurancePerPaycheck: number;
  retirementPercent: number;
  otherDeductions?: OtherDeductionItem[];
}

export interface IncomeProfile {
  employmentType: string;
  earningMethod: string;
  payFrequency: string;
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  stateTaxCode?: string;
  estimatedFederalTax: number;
  estimatedStateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  // User-input fields (v2)
  healthInsurancePerPaycheck: number;
  retirementPercent: number;
  otherDeductionItems: OtherDeductionItem[];
  // Computed annual values
  healthInsurance: number;
  retirementContribution: number;
  totalOtherDeductions: number;
  grossAnnualIncome: number;
  netAnnualIncome: number;
}

// --- API ---

export const incomeApi = {
  get: async (): Promise<IncomeProfile> => {
    const response = await apiClient.get('/api/income');
    return response.data;
  },

  createOrUpdate: async (data: CreateIncomeProfileRequest): Promise<IncomeProfile> => {
    const response = await apiClient.post('/api/income', data);
    return response.data;
  },
};
