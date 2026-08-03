import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listNews, getNewsBySlug, createNews, updateNews, deleteNews } from './api';
import type { NewsListParams } from './types';
import type { NewsFormData } from '@/features/shared/forms/schemas';

export const useNews = (params: NewsListParams = {}) =>
 useQuery({ 
 queryKey: ['news', params], 
 queryFn: () => listNews(params),
 placeholderData: keepPreviousData,
 });

export const useNewsItem = (slug: string) =>
 useQuery({
 queryKey: ['news', slug],
 queryFn: () => getNewsBySlug(slug),
 enabled: !!slug,
 });

export const useCreateNews = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: NewsFormData) => createNews(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['news'] });
 },
 });
};

export const useUpdateNews = (oldSlug: string) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: Partial<NewsFormData> & { remove_cover_image?: boolean } }) =>
 updateNews(id, data),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ['news-list'] });
 queryClient.invalidateQueries({ queryKey: ['news', oldSlug] });
 if (result.slug && result.slug !== oldSlug) {
 queryClient.invalidateQueries({ queryKey: ['news', result.slug] });
 }
 },
 });
};

export const useDeleteNews = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteNews(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['news'] });
 queryClient.removeQueries({ queryKey: ['news'] });
 },
 });
};
