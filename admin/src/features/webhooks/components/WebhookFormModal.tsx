import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { WebhookCreate, WebhookUpdate, Webhook } from '../types';

const contentTypesList = ['*', 'blog', 'news', 'project', 'insight', 'case_study'];

const schema = z.object({
 url: z.string().url('Must be a valid URL').startsWith('https://', 'URL must use HTTPS'),
 event: z.string().min(1, 'Event is required'),
 content_types: z.array(z.string()).min(1, 'Select at least one content type'),
 description: z.string().optional(),
 is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface WebhookFormModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSubmit: (data: WebhookCreate | WebhookUpdate) => void;
 initialData?: Webhook;
 isSubmitting?: boolean;
}

export const WebhookFormModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }: WebhookFormModalProps) => {
 const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
 resolver: zodResolver(schema),
 defaultValues: {
 url: initialData?.url || '',
 event: initialData?.event || 'content.published',
 content_types: initialData?.content_types || [],
 description: initialData?.description || '',
 is_active: initialData?.is_active ?? true,
 },
 });

 // Reset form when modal opens with new data
 useEffect(() => {
 if (isOpen) {
 reset({
 url: initialData?.url || '',
 event: initialData?.event || 'content.published',
 content_types: initialData?.content_types || [],
 description: initialData?.description || '',
 is_active: initialData?.is_active ?? true,
 });
 }
 }, [isOpen, initialData, reset]);

 if (!isOpen) return null;

 const handleContentTypeToggle = (type: string) => {
 const current = watch('content_types');
 if (type === '*') {
 // If selecting '*', clear everything else
 setValue('content_types', current.includes('*') ? [] : ['*']);
 } else {
 // If selecting a specific type, remove '*' if present
 let next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
 next = next.filter((t) => t !== '*');
 setValue('content_types', next);
 }
 };

 const selectedTypes = watch('content_types');

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
 <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold text-foreground ">
 {initialData ? 'Edit Webhook' : 'Create Webhook'}
 </h2>
 <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 active:scale-90">
 <X className="h-5 w-5" />
 </button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Target URL (HTTPS)</label>
 <input
 {...register('url')}
 type="text"
 placeholder="https://example.com/webhook"
 className="w-full rounded-lg border border-border bg-white px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
 />
 {errors.url && <p className="mt-1 text-sm text-destructive">{errors.url.message}</p>}
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Trigger Event</label>
 <input
 {...register('event')}
 type="text"
 readOnly
 className="w-full rounded-lg border border-border bg-white px-4 py-2 text-foreground "
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-2">Content Types</label>
 <div className="flex flex-wrap gap-2">
 {contentTypesList.map((type) => (
 <button
 key={type}
 type="button"
 onClick={() => handleContentTypeToggle(type)}
 className={`rounded-full px-4 py-1 text-sm font-medium border transition-all ${
 selectedTypes.includes(type)
 ? 'bg-primary border-primary text-primary-foreground shadow-sm'
 : 'bg-card border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary'
 }`}
 >
 {type === '*' ? 'All Content (*)' : type}
 </button>
 ))}
 </div>
 {errors.content_types && <p className="mt-1 text-sm text-destructive">{errors.content_types.message}</p>}
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
 <input
 {...register('description')}
 type="text"
 placeholder="e.g., Zapier AI trigger"
 className="w-full rounded-lg border border-border bg-white px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
 />
 </div>

 {initialData && (
 <div className="flex items-center gap-2">
 <input
 {...register('is_active')}
 id="is_active"
 type="checkbox"
 className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
 />
 <label htmlFor="is_active" className="text-sm text-foreground ">
 Active / Enabled
 </label>
 </div>
 )}

 <div className="mt-6 flex justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-white"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="interactive-button-small"
 >
 <span className="label">
  {isSubmitting ? 'Saving...' : 'Save Webhook'}
 </span>
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};
