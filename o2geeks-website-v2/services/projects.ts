import axiosServices from '@/utils/axios';
import type { ProjectOut } from '@/types/project';
import type { PaginatedResponse } from '@/types/common';

export const ProjectService = {
  async getAll(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<ProjectOut>> {
    const response = await axiosServices.get<PaginatedResponse<ProjectOut>>('/projects', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  async getBySlug(slug: string): Promise<ProjectOut> {
    const response = await axiosServices.get<ProjectOut>(`/projects/${slug}`);
    return response.data;
  }
};
