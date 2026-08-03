import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listProjects, getProjectBySlug, createProject, updateProject, deleteProject } from './api';
import type { ProjectListParams } from './types';
import type { ProjectFormData } from '@/features/shared/forms/schemas';

export const useProjects = (params: ProjectListParams = {}) =>
 useQuery({ 
 queryKey: ['projects', params], 
 queryFn: () => listProjects(params),
 placeholderData: keepPreviousData,
 });

export const useProject = (slug: string) =>
 useQuery({
 queryKey: ['project', slug],
 queryFn: () => getProjectBySlug(slug),
 enabled: !!slug,
 });

export const useCreateProject = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: ProjectFormData) => createProject(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['projects'] });
 },
 });
};

export const useUpdateProject = (oldSlug: string) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: Partial<ProjectFormData> & { existing_gallery?: string, remove_cover_image?: boolean } }) =>
 updateProject(id, data),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ['projects'] });
 queryClient.invalidateQueries({ queryKey: ['project', oldSlug] });
 if (result.slug && result.slug !== oldSlug) {
 queryClient.invalidateQueries({ queryKey: ['project', result.slug] });
 }
 },
 });
};

export const useDeleteProject = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteProject(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['projects'] });
 queryClient.removeQueries({ queryKey: ['project'] });
 },
 });
};
