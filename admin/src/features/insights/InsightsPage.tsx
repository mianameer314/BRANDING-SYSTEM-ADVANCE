import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useInsights, useDeleteInsight } from './hooks';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, truncate } from '@/utils/utils';
import type { InsightOut } from './types';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { toast } from 'react-hot-toast';
import { PermissionGuard } from '@/features/auth/components/PermissionGuard';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { ContentFilterBar } from '@/components/table/ContentFilterBar';
import { usePermission } from '@/features/auth/hooks/usePermission';

const INSIGHT_CATEGORIES = [
 { label: 'Technology', value: 'Technology' },
 { label: 'Market Trends', value: 'Market Trends' },
 { label: 'Strategy', value: 'Strategy' },
 { label: 'Research', value: 'Research' }
];

export function InsightsPage() {
 const { filters, setFilter, resetFilters } = useUrlFilters();
 const [itemToDelete, setItemToDelete] = useState<number | null>(null);
 const { setHeaderState } = useOutletContext<any>();

 const canApprove = usePermission('approve');
 const canPublish = usePermission('publish');

 const isLocked = (status: string) => {
   if (status === 'approved') return !canApprove;
   if (['published', 'scheduled', 'unpublished', 'archived'].includes(status)) return !canPublish;
   return false;
 };

 const { data, isLoading, isError, refetch } = useInsights(filters);
 const { mutateAsync: deleteInsight, isPending: isDeleting } = useDeleteInsight();

 useEffect(() => {
   setHeaderState({
     title: 'Insights',
     subtitle: data ? `${data.total} ${data.total === 1 ? 'insight' : 'insights'} total` : 'Manage insight content',
     showBackButton: false
   });
 }, [setHeaderState, data?.total]);
 
 const page = filters.page || 1;
 const perPage = filters.per_page || 10;
 const totalPages = data ? Math.ceil(data.total / perPage) : 0;
 const hasActiveFilters = !!filters.search || !!filters.status || !!filters.category || !!filters.sort_by;

 const handleDelete = async () => {
 if (!itemToDelete) return;
 try {
 await deleteInsight(itemToDelete);
 toast.success('Insight deleted successfully');
 if (data?.items.length === 1 && page > 1) {
 setFilter('page', page - 1);
 }
 } catch (err: any) {
 toast.error(err?.response?.data?.detail ?? 'Failed to delete insight');
 } finally {
 setItemToDelete(null);
 }
 };

 const columns: ColumnDef<InsightOut>[] = [
 {
 key: 'title',
 header: 'Title',
 render: (row) => (
 <div>
 <p className="font-medium text-foreground">{truncate(row.title, 55)}</p>
 <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">/{row.slug}</p>
 </div>
 ),
 },
 { key: 'status', header: 'Status', width: 'w-32', render: (row) => <StatusBadge status={row.status} /> },
 { key: 'author', header: 'Author', width: 'w-36', render: (row) => <span className="text-foreground">{row.author}</span> },
 { key: 'category', header: 'Category', width: 'w-32', render: (row) => row.category ? <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">{row.category}</span> : <span className="text-muted-foreground">—</span> },
 { key: 'created_at', header: 'Created', width: 'w-28', render: (row) => <span className="text-xs">{formatDate(row.created_at)}</span> },
 { key: 'updated_at', header: 'Updated', width: 'w-28', render: (row) => <span className="text-xs">{formatDate(row.updated_at)}</span> },
 {
 key: 'actions',
 header: '',
 width: 'w-20',
 render: (row) => (
 <div className="flex items-center justify-end gap-1">
 <PermissionGuard permission="update">
 {isLocked(row.status) ? (
   <button
     type="button"
     disabled
     className="rounded p-1.5 text-muted-foreground opacity-50 cursor-not-allowed"
     title="Content is locked in its current status. You do not have permission to modify it."
   >
     <Lock size={16} />
   </button>
 ) : (
   <Link
     to={`/insights/${row.slug}/edit`}
     className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition duration-200 active:scale-90"
     title="Edit"
   >
     <Edit2 size={16} />
   </Link>
 )}
 </PermissionGuard>
 <PermissionGuard permission="delete">
 <button
 onClick={() => setItemToDelete(row.id)}
 className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition duration-200 active:scale-90"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </PermissionGuard>
 </div>
 ),
 },
 ];

 return (
 <div className="space-y-5">
 {/* Page header (Actions Only) */}
 <div className="flex items-center justify-end">
 <PermissionGuard permission="create">
 <Link
 to="/insights/create"
 className="interactive-button-small"
 >
 <span className="label">Create New</span>
 <Plus size={16} className="icon" />
 </Link>
 </PermissionGuard>
 </div>

 <ContentFilterBar
 filters={filters}
 onChange={setFilter}
 onReset={resetFilters}
 showCategory
 categories={INSIGHT_CATEGORIES}
 />

 {isLoading && <LoadingState />}
 {isError && <ErrorState onRetry={refetch} />}
 {!isLoading && !isError && data?.items.length === 0 && (
 hasActiveFilters ? (
 <EmptyState 
 title="No matching content found" 
 description="Adjust your filters or search query to find what you're looking for."
 action={<button onClick={resetFilters} className="text-brand-500 hover:underline">Clear Filters</button>}
 />
 ) : (
 <EmptyState title="No insights yet" description="Published insights will appear here." />
 )
 )}
 {!isLoading && !isError && data && data.items.length > 0 && (
 <>
 <DataTable columns={columns} data={data.items} keyExtractor={(r) => r.id} />
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>Page {page} of {totalPages} · {data.total} results</span>
 <div className="flex items-center gap-2">
 <button onClick={() => setFilter('page', Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
 <button onClick={() => setFilter('page', Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={14} /></button>
 </div>
 </div>
 </>
 )}

 <ConfirmModal
 isOpen={itemToDelete !== null}
 title="Delete Insight?"
 message="Are you sure you want to delete this insight? This action cannot be undone."
 confirmText="Delete"
 isLoading={isDeleting}
 onConfirm={handleDelete}
 onCancel={() => setItemToDelete(null)}
 />
 </div>
 );
}
