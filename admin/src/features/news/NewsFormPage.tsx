import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useNewsItem, useCreateNews, useUpdateNews, useDeleteNews } from './hooks';

import { newsSchema, type NewsFormData } from '@/features/shared/forms/schemas';
import type { NewsGeneratedContent } from '@/features/ai/types';
import { generatePreviewToken } from '@/features/preview/api';
import { env } from '@/config/env';
import { useAuth } from '@/providers/AuthProvider';

import { ContentFormLayout } from '@/components/form/ContentFormLayout';
import { FormField } from '@/components/form/FormField';
import { FormTextarea } from '@/components/form/FormTextarea';
import { FormRichText } from '@/components/form/FormRichText';
import { StatusSelect } from '@/components/form/StatusSelect';
import { LifecycleDetails } from '@/components/form/LifecycleDetails';
import { RevisionHistory } from '@/components/form/RevisionHistory';
import { ImageUploadField } from '@/components/form/ImageUploadField';
import { FormActions } from '@/components/form/FormActions';
import { ResourceAttachments } from '@/components/form/ResourceAttachments';

import { LivePreviewModal } from '@/components/preview/LivePreviewModal';
import { GenerateDraftModal } from '@/features/ai/GenerateDraftModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { uploadPendingResources } from '@/features/resources/utils';

export default function NewsFormPage() {
  const { slug } = useParams<{ slug?: string }>();
  const isEdit = !!slug;
  const navigate = useNavigate();
  const { user } = useAuth();


  const { data: existing, isLoading, isError } = useNewsItem(slug ?? '');

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [pendingResources, setPendingResources] = useState<File[]>([]);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const shouldPreviewAfterSave = useRef(false);

  const handleLivePreview = () => setIsLivePreviewOpen(true);

  const handleSecurePreview = async () => {
    if (!existing) return;
    const dirty = isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0;
    if (dirty) {
      if (window.confirm('You have unsaved changes. Save to generate Website Preview?')) {
        shouldPreviewAfterSave.current = true;
        handleSubmit(onSubmit)();
      }
      return;
    }
    
    try {
      setIsGeneratingToken(true);
      const token = await generatePreviewToken({ content_type: 'news', content_id: existing.id });
      window.open(`${env.frontendUrl}/preview/news?token=${token}`, '_blank');
    } catch {
      toast.error('Failed to generate preview token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const [isUploadingResources, setIsUploadingResources] = useState(false);

  const {
    register,
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: { status: 'draft', is_featured: false, ai_generated: false },
    values: existing ? {
      headline: existing.headline,
      summary: existing.summary,
      source: existing.source ?? '',
      is_featured: existing.is_featured,
      status: existing.status as any,
      
      ai_generated: existing.ai_generated ?? false,
      cover_image: null,
    } : undefined,
  });

  const handleApplyDraft = (generated: NewsGeneratedContent) => {
    setValue('headline', generated.headline, { shouldDirty: true });
    setValue('summary', generated.summary, { shouldDirty: true });
    setValue('ai_generated', true, { shouldDirty: true });
    setIsAIModalOpen(false);
  };

  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews(slug ?? '');
  const deleteMutation = useDeleteNews();

  const onSubmit = async (data: NewsFormData) => {
    const payload = {
      ...data,
      cover_image: coverImageFile,
      remove_cover_image: removeCoverImage,
    };
    try {
      if (isEdit && existing) {
        await updateMutation.mutateAsync({ id: existing.id, data: payload });
        toast.success('News article updated successfully');
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'news', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/news?token=${token}`, '_blank');
          } catch {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/news');
      } else {
        const newContent = await createMutation.mutateAsync(payload);
        if (pendingResources.length > 0) {
          setIsUploadingResources(true);
          const { successCount, failCount } = await uploadPendingResources(pendingResources, 'news', newContent.id);
          setIsUploadingResources(false);
          setPendingResources([]);
          if (failCount === 0) {
            toast.success(`News article created successfully. ${successCount} resources uploaded.`);
          } else {
            toast.error(`News article created. ${successCount} resources uploaded, ${failCount} failed.`);
          }
        } else {
          toast.success('News article created successfully');
        }
        
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'news', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/news?token=${token}`, '_blank');
          } catch {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/news');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Something went wrong';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!existing?.id) return;
    try {
      await deleteMutation.mutateAsync(existing.id);
      toast.success('News article deleted successfully');
      navigate('/news');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to delete news article';
      toast.error(msg);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading news details...</div>;
  }
  if (isEdit && isError) {
    return <div className="p-8 text-center text-destructive">Failed to load news for editing.</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ContentFormLayout
            title={isEdit ? 'Edit News Article' : 'New News Article'}
            subtitle={isEdit ? `Editing: ${existing?.headline}` : 'Create a new news article'}
            headerAction={
              <button type="button" onClick={() => setIsAIModalOpen(true)} className="interactive-button-small">
                <span className="label">✨ Generate with AI</span>
                <div className="icon"></div>
              </button>
            }
            mainColumn={
              <>
                <FormField label="Headline" required error={errors.headline} {...register('headline')} />
                <Controller name="summary" control={control} render={({ field }) => (
                    <FormRichText label="Summary" required error={errors.summary} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FormField label="Source" placeholder="e.g. TechCrunch" error={errors.source} {...register('source')} />
                <hr className="border-border my-4" />
                <ResourceAttachments contentType="news" contentId={existing?.id} onPendingFilesChange={setPendingResources} disabled={isSubmitting || isUploadingResources} />
                {isEdit && existing && (
                  <div className="mt-8 flex flex-col gap-6">
                    <RevisionHistory
                      contentType="news"
                      contentId={existing.id}
                      onRestoreSuccess={() => window.location.reload()}
                    />
                  </div>
                )}
              </>
            }
            sideColumn={
              <>
                <Controller name="status" control={control} render={({ field }) => (
                    <StatusSelect value={field.value} onChange={field.onChange} currentStatus={existing?.status} userRole={user?.role ?? 'editor'} error={errors.status} />
                  )}
                />
                <FormTextarea label="Status change reason" rows={2} placeholder="Why is this status changing?" error={errors.status_reason} {...register('status_reason')} />
                {isEdit && existing && <LifecycleDetails audit={existing} />}
                <div className="flex items-center gap-3">
                  <input id="is_featured" type="checkbox" className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary" {...register('is_featured')} />
                  <label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Featured News</label>
                </div>
                <ImageUploadField label="Cover Image" currentImageUrl={isEdit ? existing?.cover_image : null} onFileChange={setCoverImageFile} onRemoveChange={setRemoveCoverImage} />
                <FormActions isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending || isUploadingResources || isGeneratingToken} isDirty={isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0} isEdit={isEdit} cancelTo="/news" onDelete={isEdit ? () => setIsDeleteModalOpen(true) : undefined} onLivePreview={handleLivePreview} onSecurePreview={isEdit ? handleSecurePreview : undefined} />
              </>
            }
          />
          <ConfirmModal isOpen={isDeleteModalOpen} title="Delete News Article?" message="This action cannot be undone. This will permanently delete this news article and its cover image." confirmText="Delete" isLoading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </form>
        
        <LivePreviewModal isOpen={isLivePreviewOpen} onClose={() => setIsLivePreviewOpen(false)} contentType="news" data={{ ...watch(), cover_image: coverImageFile || (removeCoverImage ? null : existing?.cover_image) }} />

        <GenerateDraftModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onApply={handleApplyDraft} contentType="news" />
      </div>
    </>
  );
}
