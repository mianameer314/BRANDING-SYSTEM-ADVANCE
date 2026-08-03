import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listCaseStudies, getCaseStudyBySlug, createCaseStudy, updateCaseStudy, deleteCaseStudy } from './api';
import type { CaseStudyListParams } from './types';
import type { CaseStudyFormData } from '@/features/shared/forms/schemas';

export const useCaseStudies = (params: CaseStudyListParams = {}) =>
 useQuery({ 
 queryKey: ['case-studies', params], 
 queryFn: () => listCaseStudies(params),
 placeholderData: keepPreviousData,
 });

export const useCaseStudy = (slug: string) =>
 useQuery({
 queryKey: ['case-study', slug],
 queryFn: () => getCaseStudyBySlug(slug),
 enabled: !!slug,
 });

export const useCreateCaseStudy = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: CaseStudyFormData) => createCaseStudy(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['case-studies'] });
 },
 });
};

export const useUpdateCaseStudy = (oldSlug: string) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: Partial<CaseStudyFormData> & { existing_gallery?: string, remove_cover_image?: boolean, remove_client_logo?: boolean } }) =>
 updateCaseStudy(id, data),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ['case-studies'] });
 queryClient.invalidateQueries({ queryKey: ['case-study', oldSlug] });
 if (result.slug && result.slug !== oldSlug) {
 queryClient.invalidateQueries({ queryKey: ['case-study', result.slug] });
 }
 },
 });
};

export const useDeleteCaseStudy = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteCaseStudy(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['case-studies'] });
 queryClient.removeQueries({ queryKey: ['case-study'] });
 },
 });
};
