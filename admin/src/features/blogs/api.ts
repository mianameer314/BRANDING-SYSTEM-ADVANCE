import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import { buildFormData, tagsStringToJson } from '@/utils/formdata';
import type { PaginatedResponse } from '@/types/api.types';
import type { BlogOut, BlogListParams } from './types';
import type { BlogFormData } from '@/features/shared/forms/schemas';

export const listBlogs = (params: BlogListParams): Promise<PaginatedResponse<BlogOut>> =>
 axiosInstance.get<PaginatedResponse<BlogOut>>(API.blogs.list, { params }).then((r) => r.data);

export const getBlogBySlug = (slug: string): Promise<BlogOut> =>
 axiosInstance.get<BlogOut>(API.blogs.detail(slug)).then((r) => r.data);

export const createBlog = (data: BlogFormData): Promise<BlogOut> => {
 const fd = buildFormData({
 title: data.title,
 author: data.author,
 content: data.content,
 excerpt: data.excerpt ?? '',
 category: data.category ?? '',
 tags: tagsStringToJson(data.tags),
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 });
 return axiosInstance.post<BlogOut>(API.blogs.create, fd).then((r) => r.data);
};

export const updateBlog = (id: number, data: Partial<BlogFormData> & { remove_cover_image?: boolean }): Promise<BlogOut> => {
 const fd = buildFormData({
 title: data.title,
 author: data.author,
 content: data.content,
 excerpt: data.excerpt,
 category: data.category,
 tags: tagsStringToJson(data.tags),
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 remove_cover_image: data.remove_cover_image ? 'true' : undefined,
 });
 return axiosInstance.put<BlogOut>(API.blogs.update(id), fd).then((r) => r.data);
};

export const deleteBlog = (id: number): Promise<void> =>
 axiosInstance.delete(API.blogs.delete(id)).then(() => undefined);
