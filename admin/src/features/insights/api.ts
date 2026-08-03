import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import { buildFormData, tagsStringToJson } from '@/utils/formdata';
import type { PaginatedResponse } from '@/types/api.types';
import type { InsightOut, InsightListParams } from './types';
import type { InsightFormData } from '@/features/shared/forms/schemas';

export const listInsights = (params: InsightListParams): Promise<PaginatedResponse<InsightOut>> =>
 axiosInstance.get<PaginatedResponse<InsightOut>>(API.insights.list, { params }).then((r) => r.data);

export const getInsightBySlug = (slug: string): Promise<InsightOut> =>
 axiosInstance.get<InsightOut>(API.insights.detail(slug)).then((r) => r.data);

export const createInsight = (data: InsightFormData): Promise<InsightOut> => {
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
 return axiosInstance.post<InsightOut>(API.insights.create, fd).then((r) => r.data);
};

export const updateInsight = (id: number, data: Partial<InsightFormData> & { remove_cover_image?: boolean }): Promise<InsightOut> => {
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
 return axiosInstance.put<InsightOut>(API.insights.update(id), fd).then((r) => r.data);
};

export const deleteInsight = (id: number): Promise<void> =>
 axiosInstance.delete(API.insights.delete(id)).then(() => undefined);
