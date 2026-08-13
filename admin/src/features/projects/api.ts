import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import { buildFormData, tagsStringToJson } from '@/utils/formdata';
import type { PaginatedResponse } from '@/types/api.types';
import type { ProjectOut, ProjectListParams } from './types';
import type { ProjectFormData } from '@/features/shared/forms/schemas';

export const listProjects = (params: ProjectListParams): Promise<PaginatedResponse<ProjectOut>> =>
 axiosInstance.get<PaginatedResponse<ProjectOut>>(API.projects.list, { params }).then((r) => r.data);

export const getProjectBySlug = (slug: string): Promise<ProjectOut> =>
 axiosInstance.get<ProjectOut>(API.projects.detail(slug)).then((r) => r.data);

export const createProject = (data: ProjectFormData): Promise<ProjectOut> => {
 const fd = buildFormData({
 name: data.name,
 description: data.description,
 client: data.client ?? '',
 short_desc: data.short_desc ?? '',
 technologies: tagsStringToJson(data.technologies),
 category: data.category ?? '',
 project_url: data.project_url ?? '',
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 completed_at: data.completed_at ?? '',
 ai_generated: data.ai_generated,
 cover_image: data.cover_image ?? undefined,
 gallery: data.gallery ?? undefined,
 });
 return axiosInstance.post<ProjectOut>(API.projects.create, fd).then((r) => r.data);
};

export const updateProject = (id: number, data: Partial<ProjectFormData> & { existing_gallery?: string, remove_cover_image?: boolean }): Promise<ProjectOut> => {
 const fd = buildFormData({
 name: data.name,
 description: data.description,
 client: data.client,
 short_desc: data.short_desc,
 technologies: tagsStringToJson(data.technologies),
 category: data.category,
 project_url: data.project_url,
 is_featured: data.is_featured,
 status: data.status,
 status_reason: data.status_reason,
 completed_at: data.completed_at,
 ai_generated: data.ai_generated,
 cover_image: data.cover_image ?? undefined,
 gallery: data.gallery ?? undefined,
 existing_gallery: data.existing_gallery,
 remove_cover_image: data.remove_cover_image ? 'true' : undefined,
 });
 return axiosInstance.put<ProjectOut>(API.projects.update(id), fd).then((r) => r.data);
};

export const deleteProject = (id: number): Promise<void> =>
 axiosInstance.delete(API.projects.delete(id)).then(() => undefined);
