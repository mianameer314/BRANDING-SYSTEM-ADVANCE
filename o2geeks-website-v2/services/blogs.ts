import axiosServices from '@/utils/axios';
import type { BlogOut } from '@/types/blog';
import type { PaginatedResponse } from '@/types/common';

export const BlogService = {
  async getAll(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<BlogOut>> {
    const response = await axiosServices.get<PaginatedResponse<BlogOut>>('/blogs', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  async getBySlug(slug: string): Promise<BlogOut> {
    const response = await axiosServices.get<BlogOut>(`/blogs/${slug}`);
    return response.data;
  }
};
