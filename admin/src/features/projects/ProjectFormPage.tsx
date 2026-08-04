import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useProject, useCreateProject, useUpdateProject, useDeleteProject } from './hooks';
import { useQueryClient } from '@tanstack/react-query';
import { projectSchema, type ProjectFormData } from '@/features/shared/forms/schemas';
import type { ProjectGeneratedContent } from '@/features/ai/types';
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

import { LivePreviewModal } from '@/components/preview/LivePreviewModal';
import { GenerateDraftModal } from '@/features/ai/GenerateDraftModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { uploadPendingResources } from '@/features/resources/utils';

export default function ProjectFormPage() {
  const { slug } = useParams<{ slug?: string }>();
  const isEdit = !!slug;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: existing, isLoading, isError } = useProject(slug ?? '');

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
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
    const dirty = isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0 || galleryFiles.length > 0 || (keptGalleryUrls !== null);
    if (dirty) {
      if (window.confirm('You have unsaved changes. Save to generate Website Preview?')) {
        shouldPreviewAfterSave.current = true;
        handleSubmit(onSubmit)();
      }
      return;
    }
    
    try {
      setIsGeneratingToken(true);
      const token = await generatePreviewToken({ content_type: 'project', content_id: existing.id });
      window.open(`${env.frontendUrl}/preview/projects?token=${token}`, '_blank');
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
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'draft', is_featured: false },
    values: existing ? {
      name: existing.name,
      client: existing.client ?? '',
      description: existing.description,
      short_desc: existing.short_desc ?? '',
      category: existing.category ?? '',
      technologies: existing.technologies?.join(', ') ?? '',
      project_url: existing.project_url ?? '',
      is_featured: existing.is_featured,
      status: existing.status as any,
      completed_at: existing.completed_at ? existing.completed_at.split('T')[0] : '',
      cover_image: null,
    } : undefined,
  });

  const handleApplyDraft = (generated: ProjectGeneratedContent) => {
    setValue('name', generated.name, { shouldDirty: true });
    setValue('description', generated.description, { shouldDirty: true });
    if (generated.short_desc) setValue('short_desc', generated.short_desc, { shouldDirty: true });
    if (generated.category) setValue('category', generated.category, { shouldDirty: true });
    if (generated.technologies && generated.technologies.length > 0) {
      setValue('technologies', generated.technologies.join(', '), { shouldDirty: true });
    }
    setIsAIModalOpen(false);
  };

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(slug ?? '');
  const deleteMutation = useDeleteProject();

  const onSubmit = async (data: ProjectFormData) => {
    const payload = {
      ...data,
      cover_image: coverImageFile,
      gallery: galleryFiles.length > 0 ? galleryFiles : undefined,
      existing_gallery: keptGalleryUrls !== null ? JSON.stringify(keptGalleryUrls) : undefined,
      remove_cover_image: removeCoverImage,
    };
    try {
      if (isEdit && existing) {
        await updateMutation.mutateAsync({ id: existing.id, data: payload });
        toast.success('Project updated successfully');
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'project', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/projects?token=${token}`, '_blank');
          } catch (_error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/projects');
      } else {
        const newContent = await createMutation.mutateAsync(payload);
        if (pendingResources.length > 0) {
          setIsUploadingResources(true);
          const { successCount, failCount } = await uploadPendingResources(pendingResources, 'project', newContent.id);
          setIsUploadingResources(false);
          setPendingResources([]);
          if (failCount === 0) {
            toast.success(`Project created successfully. ${successCount} resources uploaded.`);
          } else {
            toast.error(`Project created. ${successCount} resources uploaded, ${failCount} failed.`);
          }
        } else {
          toast.success('Project created successfully');
        }
        if (shouldPreviewAfterSave.current) {
          shouldPreviewAfterSave.current = false;
          try {
            setIsGeneratingToken(true);
            const token = await generatePreviewToken({ content_type: 'project', content_id: existing?.id || 0 });
            window.open(`${env.frontendUrl}/preview/projects?token=${token}`, '_blank');
          } catch (_error) {
            toast.error('Failed to generate preview token');
          } finally {
            setIsGeneratingToken(false);
          }
          return;
        }
        reset(data);
        navigate('/projects');
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
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Failed to delete project';
      toast.error(msg);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isEdit && isLoading) return <LoadingState message="Loading project..." />;
  if (isEdit && isError) {
    return <div className="p-8 text-center text-destructive">Failed to load project for editing.</div>;
  }

  if (isEdit && isLoading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading project details...</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ContentFormLayout
            title={isEdit ? 'Edit Project' : 'New Project'}
            subtitle={isEdit ? `Editing: ${existing?.name}` : 'Create a new project showcase'}
            headerAction={
              <button type="button" onClick={() => setIsAIModalOpen(true)} className="interactive-button-small">
                <span className="label">✨ Generate with AI</span>
                <div className="icon"></div>
              </button>
            }
            mainColumn={
              <>
                <FormField label="Project Name" required error={errors.name} {...register('name')} />
                <FormField label="Client" error={errors.client} {...register('client')} />
                <Controller name="description" control={control} render={({ field }) => (
                    <FormRichText label="Description" required error={errors.description} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FormTextarea label="Short Description" rows={3} placeholder="Brief summary (max 300 chars)" error={errors.short_desc} {...register('short_desc')} />
                <GalleryUploadField currentGalleryUrls={isEdit ? existing?.gallery : null} onGalleryChange={({ existingUrls, newFiles }) => { setKeptGalleryUrls(existingUrls); setGalleryFiles(newFiles); }} />
                <hr className="border-border my-4" />
                <ResourceAttachments contentType="project" contentId={existing?.id} onPendingFilesChange={setPendingResources} disabled={isSubmitting || isUploadingResources} />
                {isEdit && existing && (
                  <div className="mt-8 flex flex-col gap-6">
                    <RevisionHistory
                      contentType="project"
                      contentId={existing.id}
                      onRestoreSuccess={() => queryClient.invalidateQueries({ queryKey: ['project', slug] })}
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
                <FormField label="Category" placeholder="e.g. Web Development" error={errors.category} {...register('category')} />
                <TechInput error={errors.technologies} {...register('technologies')} />
                <FormField label="Project URL" type="url" placeholder="https://..." error={errors.project_url} {...register('project_url')} />
                <FormField label="Completed At" type="date" error={errors.completed_at} {...register('completed_at')} />
                <div className="flex items-center gap-3">
                  <input id="is_featured" type="checkbox" className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary" {...register('is_featured')} />
                  <label htmlFor="is_featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Featured Project</label>
                </div>
                <ImageUploadField label="Cover Image" currentImageUrl={isEdit ? existing?.cover_image : null} onFileChange={setCoverImageFile} onRemoveChange={setRemoveCoverImage} />
                <FormActions isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending || isUploadingResources || isGeneratingToken} isDirty={isDirty || !!coverImageFile || removeCoverImage || pendingResources.length > 0} isEdit={isEdit} cancelTo="/projects" onDelete={isEdit ? () => setIsDeleteModalOpen(true) : undefined} onLivePreview={handleLivePreview} onSecurePreview={isEdit ? handleSecurePreview : undefined} />
              </>
            }
          />
          <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Project?" message="This action cannot be undone. This will permanently delete this project and its cover image." confirmText="Delete" isLoading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </form>
        
        <LivePreviewModal isOpen={isLivePreviewOpen} onClose={() => setIsLivePreviewOpen(false)} contentType="project" data={{ ...watch(), cover_image: coverImageFile || (removeCoverImage ? null : existing?.cover_image) }} />

        <GenerateDraftModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onApply={handleApplyDraft} contentType="project" />
      </div>
    </>
  );
}
