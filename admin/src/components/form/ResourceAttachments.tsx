import { useRef, useState } from 'react';
import { 
 Trash2, 
 Download, 
 RefreshCw, 
 UploadCloud, 
 FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
 useContentResources, 
 useCreateResource, 
 useUpdateResource, 
 useDeleteResource, 
 useDownloadResource 
} from '@/features/resources/hooks';
import type { ContentType, ResourceOut } from '@/features/resources/types';
import { PermissionGuard } from '@/features/auth/components/PermissionGuard';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { formatDate } from '@/utils/utils';
import type { AxiosProgressEvent } from 'axios';

interface ResourceAttachmentsProps {
 contentType: ContentType;
 contentId?: number; // undefined in create mode
 onPendingFilesChange?: (files: File[]) => void;
 disabled?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xlsx', '.pptx'];

export function ResourceAttachments({ contentType, contentId, onPendingFilesChange, disabled }: ResourceAttachmentsProps) {
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);
 const [uploadProgress, setUploadProgress] = useState<Record<number | string, number>>({});
 const [pendingFiles, setPendingFiles] = useState<File[]>([]);
 
 // Queries & Mutations (only active if contentId is passed)
 const { data: resources, isLoading, isError } = useContentResources(contentType, contentId ?? 0);
 const createMutation = useCreateResource();
 const updateMutation = useUpdateResource(contentType, contentId ?? 0);
 const deleteMutation = useDeleteResource(contentType, contentId ?? 0);
 const downloadMutation = useDownloadResource();

 const validateFile = (file: File) => {
 if (file.size > MAX_FILE_SIZE) {
 toast.error(`File too large. Maximum size is 20MB.`);
 return false;
 }
 const ext = '.' + file.name.split('.').pop()?.toLowerCase();
 if (!ALLOWED_EXTENSIONS.includes(ext)) {
 toast.error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
 return false;
 }
 return true;
 };

 if (!contentId) {
 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-medium text-foreground">Downloadable Resources</h3>
 <p className="text-xs text-muted-foreground mt-0.5">Resources to Upload ({pendingFiles.length})</p>
 </div>
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 disabled={disabled}
 className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <UploadCloud size={14} />
 Upload File
 </button>
 <input
 ref={fileInputRef}
 type="file"
 accept={ALLOWED_EXTENSIONS.join(',')}
 className="hidden"
 disabled={disabled}
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 if (fileInputRef.current) fileInputRef.current.value = '';
 if (!validateFile(file)) return;
 
 const newFiles = [...pendingFiles, file];
 setPendingFiles(newFiles);
 onPendingFilesChange?.(newFiles);
 }}
 />
 </div>

 {pendingFiles.length === 0 ? (
 <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
 No resources queued.
 </div>
 ) : (
 <div className="space-y-2">
 {pendingFiles.map((file, idx) => (
 <div 
 key={`${file.name}-${idx}`} 
 className="flex items-center justify-between rounded-lg border border-border bg-white/50 p-3"
 >
 <div className="flex items-center gap-3 overflow-hidden">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-muted-foreground">
 <FileText size={16} />
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-foreground" title={file.name}>
 {file.name}
 </p>
 <p className="text-xs text-muted-foreground">Queued for upload</p>
 </div>
 </div>
 <div className="flex items-center gap-1 shrink-0 ml-4">
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 const newFiles = pendingFiles.filter((_, i) => i !== idx);
 setPendingFiles(newFiles);
 onPendingFilesChange?.(newFiles);
 }}
 className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50 disabled:cursor-not-allowed"
 title="Remove"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 }

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 
 // Reset input so the same file can be selected again if needed
 if (fileInputRef.current) fileInputRef.current.value = '';

 if (!validateFile(file)) return;

 const tempId = `new-${Date.now()}`;
 try {
 await createMutation.mutateAsync({
 payload: { contentType, contentId, file },
 onUploadProgress: (progressEvent: AxiosProgressEvent) => {
 if (progressEvent.total) {
 const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
 setUploadProgress(prev => ({ ...prev, [tempId]: percentCompleted }));
 }
 }
 });
 toast.success('Resource uploaded successfully');
 } catch (err: any) {
 const msg = err?.response?.data?.detail ?? 'Failed to upload resource';
 toast.error(msg);
 } finally {
 setUploadProgress(prev => {
 const next = { ...prev };
 delete next[tempId];
 return next;
 });
 }
 };

 const handleReplaceSelect = async (e: React.ChangeEvent<HTMLInputElement>, resourceId: number) => {
 const file = e.target.files?.[0];
 if (!file) return;
 
 e.target.value = '';

 if (!validateFile(file)) return;

 try {
 await updateMutation.mutateAsync({
 payload: { resourceId, file },
 onUploadProgress: (progressEvent: AxiosProgressEvent) => {
 if (progressEvent.total) {
 const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
 setUploadProgress(prev => ({ ...prev, [resourceId]: percentCompleted }));
 }
 }
 });
 toast.success('Resource replaced successfully');
 } catch (err: any) {
 const msg = err?.response?.data?.detail ?? 'Failed to replace resource';
 toast.error(msg);
 } finally {
 setUploadProgress(prev => {
 const next = { ...prev };
 delete next[resourceId];
 return next;
 });
 }
 };

 const handleDelete = async () => {
 if (!resourceToDelete) return;
 try {
 await deleteMutation.mutateAsync(resourceToDelete);
 toast.success('Resource deleted successfully');
 } catch (err: any) {
 const msg = err?.response?.data?.detail ?? 'Failed to delete resource';
 toast.error(msg);
 } finally {
 setIsDeleteModalOpen(false);
 setResourceToDelete(null);
 }
 };

 const handleDownload = async (resourceId: number) => {
 try {
 const res = await downloadMutation.mutateAsync(resourceId);
 // Create hidden link and click it
 const link = document.createElement('a');
 link.href = res.download_url;
 // Optional: Set download attribute if the file name is known
 if (res.file_name) link.download = res.file_name;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 } catch (err: any) {
 const msg = err?.response?.data?.detail ?? 'Failed to download resource';
 toast.error(msg);
 }
 };

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-medium text-foreground">Downloadable Resources</h3>
 <p className="text-xs text-muted-foreground mt-0.5">Attach files for users to download.</p>
 </div>
 <PermissionGuard permission="update">
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 disabled={disabled}
 className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <UploadCloud size={14} />
 Upload File
 </button>
 </PermissionGuard>
 <input
 ref={fileInputRef}
 type="file"
 accept={ALLOWED_EXTENSIONS.join(',')}
 className="hidden"
 disabled={disabled}
 onChange={handleFileSelect}
 />
 </div>

 {isLoading ? (
 <div className="flex justify-center p-4">
 <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
 </div>
 ) : isError ? (
 <div className="rounded border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
 Failed to load resources.
 </div>
 ) : resources && resources.length === 0 && Object.keys(uploadProgress).length === 0 ? (
 <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
 No resources attached.
 </div>
 ) : (
 <div className="space-y-2">
 {resources?.map((resource: ResourceOut) => {
 const isReplacing = uploadProgress[resource.id] !== undefined;
 const progress = uploadProgress[resource.id];

 return (
 <div 
 key={resource.id} 
 className="flex items-center justify-between rounded-lg border border-border bg-white/50 p-3"
 >
 <div className="flex items-center gap-3 overflow-hidden">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-muted-foreground">
 <FileText size={16} />
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-foreground" title={resource.file_name ?? 'Unknown file'}>
 {resource.file_name ?? 'Unknown file'}
 </p>
 <p className="text-xs text-muted-foreground">
 Added {formatDate(resource.created_at)}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-1 shrink-0 ml-4">
 {isReplacing ? (
 <div className="flex items-center gap-2 px-2">
 <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
 <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
 </div>
 <span className="text-xs text-muted-foreground">{progress}%</span>
 </div>
 ) : (
 <>
 <PermissionGuard permission="read_content">
 <button
 type="button"
 onClick={() => handleDownload(resource.id)}
 className="rounded p-1.5 text-muted-foreground hover:bg-white hover:text-foreground transition"
 title="Download"
 disabled={downloadMutation.isPending}
 >
 <Download size={14} />
 </button>
 </PermissionGuard>
 
 <PermissionGuard permission="update">
 <label
 className="cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-white hover:text-foreground transition inline-block"
 title="Replace"
 >
 <RefreshCw size={14} />
 <input
 type="file"
 className="hidden"
 accept={ALLOWED_EXTENSIONS.join(',')}
 onChange={(e) => handleReplaceSelect(e, resource.id)}
 />
 </label>
 </PermissionGuard>
 
 <PermissionGuard permission="delete">
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 setResourceToDelete(resource.id);
 setIsDeleteModalOpen(true);
 }}
 className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
 title="Delete"
 >
 <Trash2 size={14} />
 </button>
 </PermissionGuard>
 </>
 )}
 </div>
 </div>
 );
 })}
 
 {/* Ongoing new uploads */}
 {Object.entries(uploadProgress).map(([key, progress]) => {
 if (!key.startsWith('new-')) return null;
 return (
 <div 
 key={key} 
 className="flex items-center justify-between rounded-lg border border-dashed border-border bg-white/30 p-3 opacity-60"
 >
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-muted-foreground">
 <FileText size={16} />
 </div>
 <div className="min-w-0">
 <p className="text-sm font-medium text-muted-foreground">Uploading file...</p>
 </div>
 </div>
 <div className="flex items-center gap-2 px-2 shrink-0">
 <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
 <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
 </div>
 <span className="text-xs text-muted-foreground">{progress}%</span>
 </div>
 </div>
 );
 })}
 </div>
 )}

 <ConfirmModal
 isOpen={isDeleteModalOpen}
 title="Delete Resource?"
 message="Are you sure you want to delete this resource? The file will be permanently removed."
 confirmText="Delete"
 isLoading={deleteMutation.isPending}
 onConfirm={handleDelete}
 onCancel={() => {
 setIsDeleteModalOpen(false);
 setResourceToDelete(null);
 }}
 />
 </div>
 );
}
