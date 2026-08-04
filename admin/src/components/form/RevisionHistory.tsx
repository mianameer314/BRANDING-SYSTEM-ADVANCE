import { useState } from 'react';
import { createPortal } from 'react-dom';
import { History, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { listRevisions, restoreRevision } from '@/features/audit/api';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { useUser } from '@/features/users/hooks';
import type { ContentRevision } from '@/features/audit/types';

interface RevisionHistoryProps {
  contentType: 'blog' | 'news' | 'project' | 'insight' | 'case_study';
  contentId: number;
  onRestoreSuccess?: () => void;
}

function formatDate(value: string) {
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function actionLabel(action: string) {
 return action.replace(/_/g, ' '); // replace _ with space

}

function contentLabel(contentType: string) {
  return contentType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sourceLabel(source: string) {
  if (source === 'revision_restore') return 'Restored from Revision History';
  if (source === 'cms_api') return 'Saved through the CMS';
  return source.replace(/_/g, ' ');
}

function getActionTextColor(action: string) {
  if (action === 'created') return 'text-green-600 font-semibold';
  if (action === 'updated') return 'text-blue-600 font-semibold';
  if (action === 'restored') return 'text-purple-600 font-semibold';
  if (action === 'status_changed') return 'text-amber-600 font-semibold';
  if (action === 'deleted') return 'text-destructive font-semibold';
  return 'text-foreground font-semibold';
}

interface RevisionItemProps {
  revision: ContentRevision;
  canRestore: boolean;
  onRestore: (revision: ContentRevision) => void;
  isPending: boolean;
}

function RevisionItem({ revision, canRestore, onRestore, isPending }: RevisionItemProps) {
  const { data: user, isLoading } = useUser(revision.actor_id || 0);

  const changedByDisplay = revision.actor_id
    ? isLoading 
      ? `Loading...` 
      : user 
        ? user.full_name 
        : `Unknown User (ID: ${revision.actor_id})`
    : 'System';

  const actionColor = getActionTextColor(revision.action);

  return (
    <li className="rounded-md border border-border bg-white p-3 text-xs shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">
            Version {revision.version} <span className="text-muted-foreground font-normal mx-1">·</span> <span className={`capitalize ${actionColor}`}>{actionLabel(revision.action)}</span>
          </p>
          <p className="mt-1 text-muted-foreground">{formatDate(revision.created_at)}</p>
          <div className="mt-2 space-y-1">
            <p className="text-foreground"><span className="font-medium text-muted-foreground">Changed by:</span> {changedByDisplay}</p>
            <p className="text-foreground"><span className="font-medium text-muted-foreground">How this happened:</span> {sourceLabel(revision.source)}</p>
            {revision.approval_reference && <p className="text-foreground"><span className="font-medium text-muted-foreground">Approval:</span> Version {revision.version} of this {contentLabel(revision.content_type)} was approved by {changedByDisplay}.</p>}
            {revision.changed_fields && revision.changed_fields.length > 0 && <p className="text-foreground"><span className="font-medium text-muted-foreground">Changes:</span> {revision.changed_fields.join(', ')}</p>}
            {revision.status_reason && <p className="text-foreground"><span className="font-medium text-muted-foreground">Reason:</span> {revision.status_reason}</p>}
          </div>
        </div>
        {canRestore && (
          <button type="button" onClick={() => onRestore(revision)} disabled={isPending} className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border bg-white px-2.5 py-1.5 font-medium text-foreground shadow-sm hover:bg-muted disabled:opacity-50 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </div>
    </li>
  );
}

export function RevisionHistory({ contentType, contentId, onRestoreSuccess }: RevisionHistoryProps) {
 const canRestore = usePermission('publish');
 const queryClient = useQueryClient();
 const [restoreReason, setRestoreReason] = useState('');
 const [modalRevision, setModalRevision] = useState<ContentRevision | null>(null);
 const { data, isLoading, isError } = useQuery({
   queryKey: ['revisions', contentType, contentId],
   queryFn: () => listRevisions(contentType, contentId),
 });
 const restoreMutation = useMutation({
   mutationFn: (revision: ContentRevision) => restoreRevision(contentType, contentId, revision.version, restoreReason),
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['revisions', contentType, contentId] });
     queryClient.invalidateQueries({ queryKey: [contentType] });
     queryClient.invalidateQueries({ queryKey: [`${contentType}s`] });
     setRestoreReason('');
     toast.success('Revision restored and a new history entry was created.');
     onRestoreSuccess?.();
   },
   onError: (error: any) => toast.error(error?.response?.data?.detail ?? 'Could not restore revision.'),
 });

 const restore = (revision: ContentRevision) => {
   setModalRevision(revision);
 };

 const confirmRestore = () => {
   if (modalRevision) {
     restoreMutation.mutate(modalRevision);
     setModalRevision(null);
   }
 };

 return (
 <section className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
 <div className="flex items-center gap-2">
 <History className="h-4 w-4 text-primary" />
 <h2 className="font-medium text-foreground">Revision history</h2>
 </div>
 <p className="mt-1 text-xs text-muted-foreground">Every save is retained as an immutable snapshot.</p>
 {canRestore && <textarea value={restoreReason} onChange={(event) => setRestoreReason(event.target.value)} maxLength={500} rows={2} placeholder="Reason if you restore a prior version (optional)" className="mt-3 w-full rounded-md border border-border bg-white p-2 text-xs outline-none focus:border-primary" />}
 {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading revision history…</p>}
 {isError && <p className="mt-3 text-xs text-destructive">Revision history could not be loaded.</p>}
 {!isLoading && !isError && data?.items.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No revisions recorded yet.</p>}
 <ul className="mt-3 max-h-[500px] grid grid-cols-1 gap-4 sm:grid-cols-2 overflow-y-auto pr-2">
 {data?.items.map((revision) => (
  <RevisionItem key={revision.id} revision={revision} canRestore={canRestore} onRestore={restore} isPending={restoreMutation.isPending} />
 ))}
 </ul>

 {modalRevision && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
  <div className="w-full max-w-sm rounded-lg border border-border bg-white p-6 shadow-xl">
  <h3 className="text-lg font-semibold text-foreground">Confirm Restore</h3>
  <p className="mt-2 text-sm text-muted-foreground">
  Restore version {modalRevision.version}? The current content will be replaced, but it will remain in history.
  </p>
  <div className="mt-6 flex justify-end gap-3">
  <button type="button" onClick={() => setModalRevision(null)} className="rounded px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
  <button type="button" onClick={confirmRestore} disabled={restoreMutation.isPending} className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Restore</button>
  </div>
  </div>
  </div>,
  document.body
 )}

 </section>
 );
}
