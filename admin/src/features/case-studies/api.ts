import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import { buildFormData, tagsStringToJson } from '@/utils/formdata';
import type { PaginatedResponse } from '@/types/api.types';
import type { CaseStudyOut, CaseStudyListParams } from './types';
import type { CaseStudyFormData } from '@/features/shared/forms/schemas';

export const listCaseStudies = (params: CaseStudyListParams): Promise<PaginatedResponse<CaseStudyOut>> =>
 axiosInstance.get<PaginatedResponse<CaseStudyOut>>(API.caseStudies.list, { params }).then((r) => r.data);

export const getCaseStudyBySlug = (slug: string): Promise<CaseStudyOut> =>
 axiosInstance.get<CaseStudyOut>(API.caseStudies.detail(slug)).then((r) => r.data);

export const createCaseStudy = (data: CaseStudyFormData): Promise<CaseStudyOut> => {
 const fd = buildFormData({
 title: data.title,
 client_name: data.client_name,
 challenge: data.challenge,
 solution: data.solution,
 results: data.results,
 industry: data.industry ?? '',
 testimonial: data.testimonial ?? '',
 testimonial_author: data.testimonial_author ?? '',
 metrics: data.metrics ?? undefined,
 technologies: tagsStringToJson(data.technologies),
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 client_logo: data.client_logo ?? undefined,
 gallery: data.gallery ?? undefined,
 });
 return axiosInstance.post<CaseStudyOut>(API.caseStudies.create, fd).then((r) => r.data);
};

export const updateCaseStudy = (id: number, data: Partial<CaseStudyFormData> & { existing_gallery?: string, remove_cover_image?: boolean, remove_client_logo?: boolean }): Promise<CaseStudyOut> => {
 const fd = buildFormData({
 title: data.title,
 client_name: data.client_name,
 challenge: data.challenge,
 solution: data.solution,
 results: data.results,
 industry: data.industry,
 testimonial: data.testimonial,
 testimonial_author: data.testimonial_author,
 metrics: data.metrics,
 technologies: tagsStringToJson(data.technologies),
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 cover_image: data.cover_image ?? undefined,
 client_logo: data.client_logo ?? undefined,
 gallery: data.gallery ?? undefined,
 existing_gallery: data.existing_gallery,
 remove_cover_image: data.remove_cover_image ? 'true' : undefined,
 remove_client_logo: data.remove_client_logo ? 'true' : undefined,
 });
 return axiosInstance.put<CaseStudyOut>(API.caseStudies.update(id), fd).then((r) => r.data);
};

export const deleteCaseStudy = (id: number): Promise<void> =>
 axiosInstance.delete(API.caseStudies.delete(id)).then(() => undefined);
