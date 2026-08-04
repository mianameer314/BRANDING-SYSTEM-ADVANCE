import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useInsight, useCreateInsight, useUpdateInsight, useDeleteInsight } from './hooks';
import { insightSchema, type InsightFormData } from '@/features/shared/forms/schemas';
import type { InsightGeneratedContent } from '@/features/ai/types';
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
import { TagsInput } from '@/components/form/TagsInput';
import { ImageUploadField } from '@/components/form/ImageUploadField';
import { FormActions } from '@/components/form/FormActions';
import { ResourceAttachments } from '@/components/form/ResourceAttachments';

import { LivePreviewModal } from '@/components/preview/LivePreviewModal';
import { GenerateDraftModal } from '@/features/ai/GenerateDraftModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { uploadPendingResources } from '@/features/resources/utils';

export default function InsightFormPage() {
  const { slug } = useParams<{ slug?: string }>();
  const isEdit = !!slug;
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: existing, isLoading, isError } = useInsight(slug ?? '');

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
      const token = await generatePreviewToken({ content_type: 'insight', content_id: existing.id });
      window.open(`${env.frontendUrl}/preview/insights?token=${token}`, '_blank');
    } catch (_error) {
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
  } = useForm<InsightFormData>({
    resolver: zodResolver(insightSchema),
    defaultValues: { status: 'draft' },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        author: existing.author,
        content: existing.content,
        excerpt: existing.excerpt ?? '',
        category: existing.category ?? '',
        tags: existing.tags?.join(', ') ?? '',
        status: existing.status,
        cover_image: null,
      });
    }
  }, [existing, reset]);

  const handleApplyDraft = (generated: InsightGeneratedContent) => {
    setValue('title', generated.title, { shouldDirty: true });
    setValue('content', generated.content, { shouldDirty: true });
    if (generated.excerpt) setValue('excerpt', generated.excerpt, { shouldDirty: true });
    if (generated.category) setValue('category', generated.category, { shouldDirty: true });
    if (generated.tags && generated.tags.length > 0) {
      setValue('tags', generated.tags.join(', '), { shouldDirty: true });
    }
    setIsAIModalOpen(false);
  };

  const createMutation = useCreateInsight();
  const updateMutation = useUpdateInsight(slug ?? '');
  const deleteMutation = useDeleteInsight();

  const onSubmit = async (data: InsightFormData) => {
    const payload = {
      ...data,
      cover_image: coverImageFile,
      remove_cover_image: removeCoverImage,
    };
    try {
      if (isEdit && existing) {
        await updateMutation.mutateAsync({ id: existing.id, data: payload });
        toast.success('Insight updated successfully');
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'insight', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/insights?token=${token}`, '_blank');
          } catch (_error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/insights');
      } else {
        const newContent = await createMutation.mutateAsync(payload);
        if (pendingResources.length > 0) {
          setIsUploadingResources(true);
          const { successCount, failCount } = await uploadPendingResources(pendingResources, 'insight', newContent.id);
          setIsUploadingResources(false);
          setPendingResources([]);
          if (failCount === 0) {
            toast.success(`Insight created successfully. ${successCount} resources uploaded.`);
          } else {
            toast.error(`Insight created. ${successCount} resources uploaded, ${failCount} failed.`);
          }
        } else {
          toast.success('Insight created successfully');
        }
        
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'insight', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/insights?token=${token}`, '_blank');
          } catch (_error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/insights');
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
      toast.success('Insight deleted successfully');
      navigate('/insights');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to delete insight';
      toast.error(msg);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isEdit && isLoading) return <LoadingState message="Loading insight..." />;
  if (isEdit && isError) return <ErrorState message="Insight not found." />;

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ContentFormLayout
            title={isEdit ? 'Edit Insight' : 'New Insight'}
            subtitle={isEdit ? `Editing: ${existing?.title}` : 'Create a new insight article'}
            headerAction={
              <button type="button" onClick={() => setIsAIModalOpen(true)} className="interactive-button-small">
                <span className="label">✨ Generate with AI</span>
                <div className="icon"></div>
              </button>
            }
            mainColumn={
              <>
                <FormField label="Title" required error={errors.title} {...register('title')} />
                <FormField label="Author" required error={errors.author} {...register('author')} />
                <Controller name="content" control={control} render={({ field }) => (
                    <FormRichText label="Content" required error={errors.content} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FormTextarea label="Excerpt" rows={3} placeholder="A short summary (max 300 chars)" error={errors.excerpt} {...register('excerpt')} />
                <hr className="border-border my-4" />
                <ResourceAttachments contentType="insight" contentId={existing?.id} onPendingFilesChange={setPendingResources} disabled={isSubmitting || isUploadingResources} />
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
                {isEdit && existing && <RevisionHistory contentType="insight" contentId={existing.id} />}
                <FormField label="Category" placeholder="e.g. Technology" error={errors.category} {...register('category')} />
                <TagsInput error={errors.tags} {...register('tags')} />
                <ImageUploadField label="Cover Image" currentImageUrl={isEdit ? existing?.cover_image : null} onFileChange={setCoverImageFile} onRemoveChange={setRemoveCoverImage} />
                <FormActions isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending || isUploadingResources || isGeneratingToken} isDirty={isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0} isEdit={isEdit} cancelTo="/insights" onDelete={isEdit ? () => setIsDeleteModalOpen(true) : undefined} onLivePreview={handleLivePreview} onSecurePreview={isEdit ? handleSecurePreview : undefined} />
              </>
            }
          />
          <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Insight?" message="This action cannot be undone. This will permanently delete this insight and its cover image." confirmText="Delete" isLoading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </form>
        
        <LivePreviewModal isOpen={isLivePreviewOpen} onClose={() => setIsLivePreviewOpen(false)} contentType="insight" data={{ ...watch(), cover_image: coverImageFile || (removeCoverImage ? null : existing?.cover_image) }} />

        <GenerateDraftModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onApply={handleApplyDraft} contentType="insight" />
      </div>
    </>
  );
}
