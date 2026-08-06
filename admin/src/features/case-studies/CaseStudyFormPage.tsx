import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useCaseStudy, useCreateCaseStudy, useUpdateCaseStudy, useDeleteCaseStudy } from './hooks';
import { useQueryClient } from '@tanstack/react-query';
import { caseStudySchema, type CaseStudyFormData } from '@/features/shared/forms/schemas';
import type { CaseStudyGeneratedContent } from '@/features/ai/types';
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
import { TechInput } from '@/components/form/TechInput';
import { ImageUploadField } from '@/components/form/ImageUploadField';
import { FormActions } from '@/components/form/FormActions';
import { GalleryUploadField } from '@/components/form/GalleryUploadField';
import { ResourceAttachments } from '@/components/form/ResourceAttachments';
import { MetricsEditor } from '@/components/form/MetricsEditor';

import { LivePreviewModal } from '@/components/preview/LivePreviewModal';
import { GenerateDraftModal } from '@/features/ai/GenerateDraftModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { uploadPendingResources } from '@/features/resources/utils';

export default function CaseStudyFormPage() {
  const { slug } = useParams<{ slug?: string }>();
  const isEdit = !!slug;
  const navigate = useNavigate();
  const { user } = useAuth();


  const { data: existing, isLoading, isError } = useCaseStudy(slug ?? '');

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [clientLogoFile, setClientLogoFile] = useState<File | null>(null);
  const [removeClientLogo, setRemoveClientLogo] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [keptGalleryUrls, setKeptGalleryUrls] = useState<string[] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [pendingResources, setPendingResources] = useState<File[]>([]);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const shouldPreviewAfterSave = useRef(false);

  const handleLivePreview = () => setIsLivePreviewOpen(true);

  const handleSecurePreview = async () => {
    if (!existing) return;
    const dirty = isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0 || galleryFiles.length > 0 || (keptGalleryUrls !== null) || !!clientLogoFile || removeClientLogo;
    if (dirty) {
      if (window.confirm('You have unsaved changes. Save to generate Website Preview?')) {
        shouldPreviewAfterSave.current = true;
        handleSubmit(onSubmit)();
      }
      return;
    }
    
    try {
      setIsGeneratingToken(true);
      const token = await generatePreviewToken({ content_type: 'case_study', content_id: existing.id });
      window.open(`${env.frontendUrl}/preview/case-studies?token=${token}`, '_blank');
    } catch (error) {
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
  } = useForm<CaseStudyFormData>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: { status: 'draft', is_featured: false, metrics: [] },
    values: existing ? {
      title: existing.title,
      client_name: existing.client_name,
      industry: existing.industry ?? '',
      challenge: existing.challenge,
      solution: existing.solution,
      results: existing.results,
      metrics: existing.metrics ?? [],
      testimonial: existing.testimonial ?? '',
      testimonial_author: existing.testimonial_author ?? '',
      technologies: existing.technologies?.join(', ') ?? '',
      is_featured: existing.is_featured,
      status: existing.status as any,
      cover_image: null,
      client_logo: null,
    } : undefined,
  });

  const handleApplyDraft = (generated: CaseStudyGeneratedContent) => {
    setValue('title', generated.title, { shouldDirty: true });
    setValue('client_name', generated.client_name, { shouldDirty: true });
    if (generated.industry) setValue('industry', generated.industry, { shouldDirty: true });
    setValue('challenge', generated.challenge, { shouldDirty: true });
    setValue('solution', generated.solution, { shouldDirty: true });
    setValue('results', generated.results, { shouldDirty: true });
    if (generated.technologies && generated.technologies.length > 0) {
      setValue('technologies', generated.technologies.join(', '), { shouldDirty: true });
    }
    if (generated.metrics && generated.metrics.length > 0) {
      setValue('metrics', generated.metrics, { shouldDirty: true });
    }
    if (generated.testimonial) setValue('testimonial', generated.testimonial, { shouldDirty: true });
    if (generated.testimonial_author) setValue('testimonial_author', generated.testimonial_author, { shouldDirty: true });
    setIsAIModalOpen(false);
  };

  const createMutation = useCreateCaseStudy();
  const updateMutation = useUpdateCaseStudy(slug ?? '');
  const deleteMutation = useDeleteCaseStudy();

  const onSubmit = async (data: CaseStudyFormData) => {
    const payload = {
      ...data,
      cover_image: coverImageFile,
      client_logo: clientLogoFile,
      gallery: galleryFiles.length > 0 ? galleryFiles : undefined,
      existing_gallery: keptGalleryUrls !== null ? JSON.stringify(keptGalleryUrls) : undefined,
      remove_cover_image: removeCoverImage,
      remove_client_logo: removeClientLogo,
    };
    try {
      if (isEdit && existing) {
        await updateMutation.mutateAsync({ id: existing.id, data: payload });
        toast.success('Case study updated successfully');
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'case_study', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/case-studies?token=${token}`, '_blank');
          } catch (error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/case-studies');
      } else {
        const newContent = await createMutation.mutateAsync(payload);
        if (pendingResources.length > 0) {
          setIsUploadingResources(true);
          const { successCount, failCount } = await uploadPendingResources(pendingResources, 'case_study', newContent.id);
          setIsUploadingResources(false);
          setPendingResources([]);
          if (failCount === 0) {
            toast.success(`Case study created successfully. ${successCount} resources uploaded.`);
          } else {
            toast.error(`Case study created. ${successCount} resources uploaded, ${failCount} failed.`);
          }
        } else {
          toast.success('Case study created successfully');
        }
        
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'case_study', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/case-studies?token=${token}`, '_blank');
          } catch (error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/case-studies');
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
      toast.success('Case study deleted successfully');
      navigate('/case-studies');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to delete case study';
      toast.error(msg);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isEdit && isLoading) return <LoadingState message="Loading case study..." />;
  if (isEdit && isError) {
    return <div className="p-8 text-center text-destructive">Failed to load case study for editing.</div>;
  }

  if (isEdit && isLoading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading case study details...</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ContentFormLayout
            title={isEdit ? 'Edit Case Study' : 'New Case Study'}
            subtitle={isEdit ? `Editing: ${existing?.title}` : 'Showcase a client success story'}
            headerAction={
              <button type="button" onClick={() => setIsAIModalOpen(true)} className="interactive-button-small">
                <span className="label">✨ Generate with AI</span>
                <div className="icon"></div>
              </button>
            }
            mainColumn={
              <>
                <FormField label="Title" required error={errors.title} {...register('title')} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Client Name" required error={errors.client_name} {...register('client_name')} />
                  <FormField label="Industry" placeholder="e.g. Finance" error={errors.industry} {...register('industry')} />
                </div>

                <Controller name="challenge" control={control} render={({ field }) => (
                  <FormRichText label="Challenge" required error={errors.challenge} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="solution" control={control} render={({ field }) => (
                  <FormRichText label="Solution" required error={errors.solution} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="results" control={control} render={({ field }) => (
                  <FormRichText label="Results" required error={errors.results} value={field.value} onChange={field.onChange} />
                )} />

                <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
                  <h3 className="text-sm font-medium text-foreground">Testimonial (Optional)</h3>
                  <FormTextarea label="Quote" rows={3} error={errors.testimonial} {...register('testimonial')} />
                  <FormField label="Author" placeholder="e.g. Jane Doe, CEO" error={errors.testimonial_author} {...register('testimonial_author')} />
                </div>

                <div className="rounded-lg border border-border p-4">
                  <Controller name="metrics" control={control} render={({ field }) => (
                    <MetricsEditor value={field.value ?? []} onChange={field.onChange} />
                  )} />
                </div>

                <GalleryUploadField currentGalleryUrls={isEdit ? existing?.gallery : null} onGalleryChange={({ existingUrls, newFiles }) => { setKeptGalleryUrls(existingUrls); setGalleryFiles(newFiles); }} />
                <hr className="border-border my-4" />
                <ResourceAttachments contentType="case_study" contentId={existing?.id} onPendingFilesChange={setPendingResources} disabled={isSubmitting || isUploadingResources} />
                {isEdit && existing && (
                  <div className="mt-8 flex flex-col gap-6">
                    <RevisionHistory
                      contentType="case_study"
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
                <TechInput error={errors.technologies} {...register('technologies')} />
                <div className="flex items-center gap-3">
                  <input id="is_featured" type="checkbox" className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary" {...register('is_featured')} />
                  <label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Featured Case Study</label>
                </div>
                <ImageUploadField label="Cover Image" currentImageUrl={isEdit ? existing?.cover_image : null} onFileChange={setCoverImageFile} onRemoveChange={setRemoveCoverImage} />
                <ImageUploadField label="Client Logo" currentImageUrl={isEdit ? existing?.client_logo : null} onFileChange={setClientLogoFile} onRemoveChange={setRemoveClientLogo} />
                <FormActions isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending || isUploadingResources || isGeneratingToken} isDirty={isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0} isEdit={isEdit} cancelTo="/case-studies" onDelete={isEdit ? () => setIsDeleteModalOpen(true) : undefined} onLivePreview={handleLivePreview} onSecurePreview={isEdit ? handleSecurePreview : undefined} />
              </>
            }
          />
          <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Case Study?" message="This action cannot be undone. This will permanently delete this case study and its cover image." confirmText="Delete" isLoading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </form>
        
        <LivePreviewModal isOpen={isLivePreviewOpen} onClose={() => setIsLivePreviewOpen(false)} contentType="case_study" data={{ ...watch(), cover_image: coverImageFile || (removeCoverImage ? null : existing?.cover_image) }} />

        <GenerateDraftModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onApply={handleApplyDraft} contentType="case_study" />
      </div>
    </>
  );
}
