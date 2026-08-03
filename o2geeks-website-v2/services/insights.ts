import axiosServices from '@/utils/axios';
import type { InsightOut } from '@/types/insight';
import type { PaginatedResponse } from '@/types/common';

export const InsightService = {
  async getAll(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<InsightOut>> {
    const response = await axiosServices.get<PaginatedResponse<InsightOut>>('/insights', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  async getBySlug(slug: string): Promise<InsightOut> {
    const response = await axiosServices.get<InsightOut>(`/insights/${slug}`);
    return response.data;
  }
};
