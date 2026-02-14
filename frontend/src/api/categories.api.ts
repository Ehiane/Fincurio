import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  categoryGroup?: string;
  isCustom: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  displayName: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  categoryGroup?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoryListResponse>('/api/categories');
    return response.data.categories;
  },

  create: async (request: CreateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/api/categories', request);
    return data;
  },

  updateGroup: async (id: string, categoryGroup: string | null): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/api/categories/${id}/group`, { categoryGroup });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};
