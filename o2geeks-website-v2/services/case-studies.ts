import axiosServices from '@/utils/axios';
import type { CaseStudyOut } from '@/types/case-study';
import type { PaginatedResponse } from '@/types/common';

export const CaseStudyService = {
  async getAll(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<CaseStudyOut>> {
    const response = await axiosServices.get<PaginatedResponse<CaseStudyOut>>('/case-studies', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  async getBySlug(slug: string): Promise<CaseStudyOut> {
    const response = await axiosServices.get<CaseStudyOut>(`/case-studies/${slug}`);
    return response.data;
  }
};
