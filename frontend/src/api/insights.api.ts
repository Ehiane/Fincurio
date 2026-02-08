import { apiClient } from './client';
import { Transaction } from './transactions.api';

export interface MonthlyFlow {
  date: string;
  income: number;
  spending: number;
}

export interface MoneyFlowResponse {
  earliestDate: string | null;
  latestDate: string | null;
  filterStart: string;
  filterEnd: string;
  grouping: 'daily' | 'weekly' | 'monthly' | 'yearly';
  balanceChange: number;
  dataPoints: MonthlyFlow[];
}

export interface DashboardResponse {
  currentBalance: number;
  balanceChange: number;
  recentTransactions: Transaction[];
  monthlyFlow: MonthlyFlow[];
}

export interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    color: string;
  };
  amount: number;
  transactionCount: number;
  percentOfTotal: number;
}

export interface MonthlyInsightResponse {
  period: {
    year: number;
    month: number;
    displayName: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    changeFromPreviousMonth: number;
  };
  categoryBreakdown: CategoryBreakdown[];
}

export const insightsApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get('/api/insights/dashboard');
    return response.data;
  },

  getMoneyFlow: async (startDate?: string, endDate?: string, grouping?: string): Promise<MoneyFlowResponse> => {
    const response = await apiClient.get('/api/insights/money-flow', {
      params: { startDate, endDate, grouping },
    });
    return response.data;
  },

  getMonthlyInsights: async (year: number, month: number): Promise<MonthlyInsightResponse> => {
    const response = await apiClient.get('/api/insights/monthly', {
      params: { year, month },
    });
    return response.data;
  },
};
