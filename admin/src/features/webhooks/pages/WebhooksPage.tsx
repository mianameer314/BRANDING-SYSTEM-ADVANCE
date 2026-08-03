import { useState } from 'react';
import { Plus, Edit2, Trash2, Activity, Zap, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useWebhooks, useDeleteWebhook, useUpdateWebhook, useTestWebhook } from '../hooks';
import type { Webhook } from '../types';
import { WebhookFormModal } from '../components/WebhookFormModal';
import { WebhookLogsModal } from '../components/WebhookLogsModal';
import { useCreateWebhook } from '../hooks';

export const WebhooksPage = () => {
 const [page] = useState(1);
 const [isFormOpen, setIsFormOpen] = useState(false);
 const [isLogsOpen, setIsLogsOpen] = useState(false);
 const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

 const { data, isLoading } = useWebhooks({ page, per_page: 20 });
 const createWebhook = useCreateWebhook();
 const updateWebhook = useUpdateWebhook();
 const deleteWebhook = useDeleteWebhook();
 const testWebhook = useTestWebhook();

 const handleOpenCreate = () => {
 setSelectedWebhook(null);
 setIsFormOpen(true);
 };

 const handleOpenEdit = (webhook: Webhook) => {
 setSelectedWebhook(webhook);
 setIsFormOpen(true);
 };

 const handleOpenLogs = (webhook: Webhook) => {
 setSelectedWebhook(webhook);
 setIsLogsOpen(true);
 };

 const handleSubmit = (formData: any) => {
 if (selectedWebhook) {
 updateWebhook.mutate(
 { id: selectedWebhook.id, data: formData },
 {
 onSuccess: () => {
 toast.success('Webhook updated successfully');
 setIsFormOpen(false);
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.detail || 'Failed to update webhook');
 }
 }
 );
 } else {
 createWebhook.mutate(formData, {
 onSuccess: () => {
 toast.success('Webhook created successfully');
 setIsFormOpen(false);
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.detail || 'Failed to create webhook');
 }
 });
 }
 };

 const handleDelete = (id: number) => {
 if (window.confirm('Are you sure you want to delete this webhook?')) {
 deleteWebhook.mutate(id, {
 onSuccess: () => toast.success('Webhook deleted'),
 onError: () => toast.error('Failed to delete webhook'),
 });
 }
 };

 const handleToggleStatus = (webhook: Webhook) => {
 updateWebhook.mutate(
 { id: webhook.id, data: { is_active: !webhook.is_active } },
 {
 onSuccess: () => toast.success(`Webhook ${webhook.is_active ? 'disabled' : 'enabled'}`),
 onError: () => toast.error('Failed to update status'),
 }
 );
 };

 const handleTestPing = (id: number) => {
 const loadingToast = toast.loading('Sending test ping...');
 testWebhook.mutate(id, {
 onSuccess: (res) => {
 toast.dismiss(loadingToast);
 if (res.success) toast.success(res.message);
 else toast.error(res.message);
 },
 onError: (err: any) => {
 toast.dismiss(loadingToast);
 toast.error(err.response?.data?.detail || 'Ping failed');
 }
 });
 };

 return (
 <div className="p-6">
 <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage outbound integrations and event notifications.
        </p>
      </div>
      <button
        onClick={handleOpenCreate}
        className="interactive-button-small"
      >
        <span className="label flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Webhook
        </span>
      </button>
    </div>

 <div className="rounded-xl border bg-white shadow-sm ">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm text-gray-600 ">
 <thead className="bg-white text-xs uppercase text-muted-foreground ">
 <tr>
 <th className="px-6 py-4 font-medium">Target URL</th>
 <th className="px-6 py-4 font-medium">Event</th>
 <th className="px-6 py-4 font-medium">Content Types</th>
 <th className="px-6 py-4 font-medium">Status</th>
 <th className="px-6 py-4 font-medium text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 ">
 {isLoading ? (
 <tr>
 <td colSpan={5} className="py-10 text-center text-muted-foreground">Loading webhooks...</td>
 </tr>
 ) : data?.items.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-10 text-center text-muted-foreground">No webhooks registered.</td>
 </tr>
 ) : (
 data?.items.map((webhook) => (
 <tr key={webhook.id} className="hover:bg-white">
 <td className="px-6 py-4">
 <div className="font-medium text-foreground ">{webhook.url}</div>
 <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
 <Shield className="h-3 w-3" /> HMAC Signed
 </div>
 </td>
 <td className="px-6 py-4 font-mono text-xs">{webhook.event}</td>
 <td className="px-6 py-4">
 <div className="flex flex-wrap gap-1">
 {webhook.content_types.map(ct => (
 <span key={ct} className="rounded bg-info/10 px-2 py-0.5 text-xs text-info ">
 {ct}
 </span>
 ))}
 </div>
 </td>
 <td className="px-6 py-4">
 <button
 onClick={() => handleToggleStatus(webhook)}
 className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
 title="Toggle Status"
 >
 {webhook.is_active ? (
 <>
 <ToggleRight className="h-6 w-6 text-success" />
 <span className="text-xs font-medium text-success ">Active</span>
 </>
 ) : (
 <>
 <ToggleLeft className="h-6 w-6 text-muted-foreground" />
 <span className="text-xs font-medium text-muted-foreground">Disabled</span>
 </>
 )}
 </button>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-1.5">
 <button
 onClick={() => handleTestPing(webhook.id)}
 className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-amber-100 hover:text-amber-600 transition-colors"
 title="Send Test Ping"
 >
 <Zap className="h-3.5 w-3.5" />
 <span>Ping</span>
 </button>
 <button
 onClick={() => handleOpenLogs(webhook)}
 className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-blue-100 hover:text-blue-600 transition-colors"
 title="View Delivery Logs"
 >
 <Activity className="h-3.5 w-3.5" />
 <span>Logs</span>
 </button>
 <button
 onClick={() => handleOpenEdit(webhook)}
 className="rounded p-1.5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
 title="Edit Webhook"
 >
 <Edit2 className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleDelete(webhook.id)}
 className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
 title="Delete Webhook"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 <WebhookFormModal
 isOpen={isFormOpen}
 onClose={() => setIsFormOpen(false)}
 onSubmit={handleSubmit}
 initialData={selectedWebhook || undefined}
 isSubmitting={createWebhook.isPending || updateWebhook.isPending}
 />

 <WebhookLogsModal
 isOpen={isLogsOpen}
 onClose={() => setIsLogsOpen(false)}
 webhookId={selectedWebhook?.id || null}
 />
 </div>
 );
};
