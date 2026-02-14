import { apiClient } from './client';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  merchant: string;
  category: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    color: string;
  };
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
  goalId?: string;
  goalName?: string;
}

export interface CreateTransactionRequest {
  date: string;
  time: string;
  merchant: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  notes?: string;
  goalId?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export const transactionsApi = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<TransactionListResponse> => {
    const response = await apiClient.get('/api/transactions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/api/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post('/api/transactions', data);
    return response.data;
  },

  update: async (id: string, data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put(`/api/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/transactions/${id}`);
  },
};
