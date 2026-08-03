import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import { buildFormData } from '@/lib/formdata';
import type { PaginatedResponse } from '@/types/api.types';
import type { NewsOut, NewsListParams } from './types';
import type { NewsFormData } from '@/features/shared/forms/schemas';

export const listNews = (params: NewsListParams): Promise<PaginatedResponse<NewsOut>> =>
 axiosInstance.get<PaginatedResponse<NewsOut>>(API.news.list, { params }).then((r) => r.data);

export const getNewsBySlug = (slug: string): Promise<NewsOut> =>
 axiosInstance.get<NewsOut>(API.news.detail(slug)).then((r) => r.data);

export const createNews = (data: NewsFormData): Promise<NewsOut> => {
 const fd = buildFormData({
 headline: data.headline,
 summary: data.summary,
 source: data.source ?? '',
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 });
 return axiosInstance.post<NewsOut>(API.news.create, fd).then((r) => r.data);
};

export const updateNews = (id: number, data: Partial<NewsFormData> & { remove_cover_image?: boolean }): Promise<NewsOut> => {
 const fd = buildFormData({
 headline: data.headline,
 summary: data.summary,
 source: data.source,
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 remove_cover_image: data.remove_cover_image ? 'true' : undefined,
 });
 return axiosInstance.put<NewsOut>(API.news.update(id), fd).then((r) => r.data);
};

export const deleteNews = (id: number): Promise<void> =>
 axiosInstance.delete(API.news.delete(id)).then(() => undefined);
