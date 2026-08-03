import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { listWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook, listWebhookLogs, testWebhook } from './api';
import type { WebhookCreate, WebhookUpdate } from './types';

export const useWebhooks = (params: { page: number; per_page: number; is_active?: boolean }) =>
 useQuery({ 
 queryKey: ['webhooks', params], 
 queryFn: () => listWebhooks(params),
 placeholderData: keepPreviousData,
 });

export const useWebhook = (id: number) =>
 useQuery({
 queryKey: ['webhook', id],
 queryFn: () => getWebhook(id),
 enabled: !!id,
 });

export const useCreateWebhook = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: WebhookCreate) => createWebhook(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['webhooks'] });
 },
 });
};

export const useUpdateWebhook = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: WebhookUpdate }) => updateWebhook(id, data),
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: ['webhooks'] });
 queryClient.invalidateQueries({ queryKey: ['webhook', variables.id] });
 },
 });
};

export const useDeleteWebhook = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteWebhook(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['webhooks'] });
 },
 });
};

export const useWebhookLogs = (id: number, params: { page: number; per_page: number }) =>
 useQuery({
 queryKey: ['webhookLogs', id, params],
 queryFn: () => listWebhookLogs(id, params),
 enabled: !!id,
 placeholderData: keepPreviousData,
 });

export const useTestWebhook = () => {
 return useMutation({
 mutationFn: (id: number) => testWebhook(id),
 });
};
