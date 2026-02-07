import { apiClient } from './client';

export interface Merchant {
  id: string;
  name: string;
}

export interface MerchantListResponse {
  merchants: Merchant[];
}

export interface CreateMerchantRequest {
  name: string;
}

export const merchantsApi = {
  getAll: async (): Promise<Merchant[]> => {
    const { data } = await apiClient.get<MerchantListResponse>('/api/merchants');
    return data.merchants;
  },

  create: async (request: CreateMerchantRequest): Promise<Merchant> => {
    const { data } = await apiClient.post<Merchant>('/api/merchants', request);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/merchants/${id}`);
  },
};
