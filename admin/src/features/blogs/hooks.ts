import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from './api';
import type { BlogListParams } from './types';
import type { BlogFormData } from '@/features/shared/forms/schemas';

export const useBlogs = (params: BlogListParams = {}) =>
 useQuery({ 
 queryKey: ['blogs', params], 
 queryFn: () => listBlogs(params),
 placeholderData: keepPreviousData,
 });

export const useBlog = (slug: string) =>
 useQuery({
 queryKey: ['blog', slug],
 queryFn: () => getBlogBySlug(slug),
 enabled: !!slug,
 });

export const useCreateBlog = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: BlogFormData) => createBlog(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['blogs'] });
 },
 });
};

export const useUpdateBlog = (oldSlug: string) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: Partial<BlogFormData> & { remove_cover_image?: boolean } }) =>
 updateBlog(id, data),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ['blogs'] });
 if (result.slug && result.slug !== oldSlug) {
 queryClient.removeQueries({ queryKey: ['blog', oldSlug] });
 queryClient.invalidateQueries({ queryKey: ['blog', result.slug] });
 } else {
 queryClient.invalidateQueries({ queryKey: ['blog', oldSlug] });
 }
 },
 });
};

export const useDeleteBlog = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteBlog(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['blogs'] });
 queryClient.removeQueries({ queryKey: ['blog'] });
 },
 });
};
