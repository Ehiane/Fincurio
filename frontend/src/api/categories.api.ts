import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
}

export interface CategoryListResponse {
  categories: Category[];
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoryListResponse>('/api/categories');
    return response.data.categories;
  },
};
