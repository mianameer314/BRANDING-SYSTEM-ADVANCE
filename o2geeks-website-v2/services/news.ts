import axiosServices from '@/utils/axios';
import type { NewsOut } from '@/types/news';
import type { PaginatedResponse } from '@/types/common';

export const NewsService = {
  async getAll(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<NewsOut>> {
    const response = await axiosServices.get<PaginatedResponse<NewsOut>>('/news', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  async getBySlug(slug: string): Promise<NewsOut> {
    const response = await axiosServices.get<NewsOut>(`/news/${slug}`);
    return response.data;
  }
};
