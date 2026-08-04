import { useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { listRevisions, restoreRevision } from '@/features/audit/api';
import { usePermission } from '@/features/auth/hooks/usePermission';
import type { ContentRevision } from '@/features/audit/types';

interface RevisionHistoryProps {
 contentType: 'blog' | 'news' | 'project' | 'insight' | 'case_study';
 contentId: number;
}

function formatDate(value: string) {
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function actionLabel(action: string) {
 return action.replaceAll('_', ' ');
}

export function RevisionHistory({ contentType, contentId }: RevisionHistoryProps) {
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
 <section className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
 <div className="flex items-center gap-2">
 <History className="h-4 w-4 text-primary" />
 <h2 className="font-medium text-foreground">Revision history</h2>
 </div>
 <p className="mt-1 text-xs text-muted-foreground">Every save is retained as an immutable snapshot.</p>
 {canRestore && <textarea value={restoreReason} onChange={(event) => setRestoreReason(event.target.value)} maxLength={500} rows={2} placeholder="Reason if you restore a prior version (optional)" className="mt-3 w-full rounded-md border border-border bg-white p-2 text-xs outline-none focus:border-primary" />}
 {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading revision history…</p>}
 {isError && <p className="mt-3 text-xs text-destructive">Revision history could not be loaded.</p>}
 {!isLoading && !isError && data?.items.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No revisions recorded yet.</p>}
 <ul className="mt-3 max-h-[500px] space-y-2 overflow-y-auto pr-2">
 {data?.items.map((revision) => (
 <li key={revision.id} className="rounded-md border border-border bg-white p-2 text-xs">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="font-medium capitalize text-foreground">Version {revision.version} · {actionLabel(revision.action)}</p>
 <p className="mt-0.5 text-muted-foreground">{formatDate(revision.created_at)} · User {revision.actor_id ?? 'system'}</p>
 {revision.changed_fields && <p className="mt-1 text-muted-foreground">Changed: {revision.changed_fields.join(', ')}</p>}
 {revision.status_reason && <p className="mt-1 text-muted-foreground">Reason: {revision.status_reason}</p>}
 </div>
 {canRestore && <button type="button" onClick={() => restore(revision)} disabled={restoreMutation.isPending} className="inline-flex shrink-0 items-center gap-1 rounded border border-border px-2 py-1 font-medium text-foreground hover:bg-muted disabled:opacity-50"><RotateCcw className="h-3 w-3" />Restore</button>}
 </div>
 </li>
 ))}
 </ul>

 {modalRevision && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
 </div>
 )}

 </section>
 );
}
