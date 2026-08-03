import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listInsights, getInsightBySlug, createInsight, updateInsight, deleteInsight } from './api';
import type { InsightListParams } from './types';
import type { InsightFormData } from '@/features/shared/forms/schemas';

export const useInsights = (params: InsightListParams = {}) =>
 useQuery({ 
 queryKey: ['insights', params], 
 queryFn: () => listInsights(params),
 placeholderData: keepPreviousData,
 });

export const useInsight = (slug: string) =>
 useQuery({
 queryKey: ['insight', slug],
 queryFn: () => getInsightBySlug(slug),
 enabled: !!slug,
 });

export const useCreateInsight = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: InsightFormData) => createInsight(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['insights'] });
 },
 });
};

export const useUpdateInsight = (oldSlug: string) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: Partial<InsightFormData> & { remove_cover_image?: boolean } }) =>
 updateInsight(id, data),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ['insights'] });
 queryClient.invalidateQueries({ queryKey: ['insight', oldSlug] });
 if (result.slug && result.slug !== oldSlug) {
 queryClient.invalidateQueries({ queryKey: ['insight', result.slug] });
 }
 },
 });
};

export const useDeleteInsight = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteInsight(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['insights'] });
 queryClient.removeQueries({ queryKey: ['insight'] });
 },
 });
};
