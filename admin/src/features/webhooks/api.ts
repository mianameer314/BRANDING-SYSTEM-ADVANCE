import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { PaginatedResponse } from '@/types/api.types';
import type { Webhook, WebhookCreate, WebhookUpdate, WebhookLog } from './types';

export const listWebhooks = (params: { page: number; per_page: number; is_active?: boolean }): Promise<PaginatedResponse<Webhook>> =>
 axiosInstance.get<PaginatedResponse<Webhook>>(API.webhooks.list, { params }).then((r) => r.data);

export const getWebhook = (id: number): Promise<Webhook> =>
 axiosInstance.get<Webhook>(API.webhooks.detail(id)).then((r) => r.data);

export const createWebhook = (data: WebhookCreate): Promise<Webhook> =>
 axiosInstance.post<Webhook>(API.webhooks.create, data).then((r) => r.data);

export const updateWebhook = (id: number, data: WebhookUpdate): Promise<Webhook> =>
 axiosInstance.put<Webhook>(API.webhooks.update(id), data).then((r) => r.data);

export const deleteWebhook = (id: number): Promise<void> =>
 axiosInstance.delete(API.webhooks.delete(id)).then(() => undefined);

export const listWebhookLogs = (id: number, params: { page: number; per_page: number }): Promise<PaginatedResponse<WebhookLog>> =>
 axiosInstance.get<PaginatedResponse<WebhookLog>>(API.webhooks.logs(id), { params }).then((r) => r.data);

export const testWebhook = (id: number): Promise<{ success: boolean; message: string }> =>
 axiosInstance.post<{ success: boolean; message: string }>(API.webhooks.test(id)).then((r) => r.data);
