import { useState } from 'react';
import { useUsers, useDeactivateUser, useUpdateUser } from './hooks';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/utils/utils';
import type { UserOut } from './types';
import { ChevronLeft, ChevronRight, Plus, Edit2, UserX, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';

const PER_PAGE = 10;

const roleColors: Record<string, string> = {
 super_admin: 'bg-primary/40 text-foreground border-primary',
 admin: 'bg-info/10 text-info border-info/30',
 editor: 'bg-success/10 text-success border-success/30',
 user: 'bg-muted text-muted-foreground border-border',
};

const roleLabels: Record<string, string> = {
 super_admin: 'Super Admin',
 admin: 'Admin',
 editor: 'Editor',
 user: 'User',
};

export function UsersPage() {
 const [page, setPage] = useState(1);
 const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);
 
 const { data, isLoading, isError, refetch } = useUsers({ page, per_page: PER_PAGE });
 const { mutateAsync: deactivateUser, isPending: isDeactivating } = useDeactivateUser();
 const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
 const { user: currentUser } = useAuth();

 const handleDeactivate = async () => {
 if (!userToDeactivate) return;
 try {
 await deactivateUser(userToDeactivate);
 toast.success('User deactivated successfully');
 } catch (err: any) {
 toast.error(err?.response?.data?.detail ?? 'Failed to deactivate user');
 } finally {
 setUserToDeactivate(null);
 }
 };

 const handleReactivate = async (id: number) => {
 try {
 await updateUser({ id, data: { is_active: true } });
 toast.success('User reactivated successfully');
 } catch (err: any) {
 toast.error(err?.response?.data?.detail ?? 'Failed to reactivate user');
 }
 };

 const columns: ColumnDef<UserOut>[] = [
 {
 key: 'id',
 header: 'ID',
 width: 'w-16',
 render: (row) => <span className="text-muted-foreground">{row.id}</span>,
 },
 {
 key: 'full_name',
 header: 'Name',
 render: (row) => <span className="font-medium text-foreground">{row.full_name}</span>,
 },
 {
 key: 'email',
 header: 'Email',
 render: (row) => <span className="text-muted-foreground">{row.email}</span>,
 },
 {
 key: 'role',
 header: 'Role',
 width: 'w-32',
 render: (row) => (
 <span className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${roleColors[row.role] || roleColors.user}`}>
 {roleLabels[row.role] || row.role}
 </span>
 ),
 },
 {
 key: 'is_active',
 header: 'Status',
 width: 'w-24',
 render: (row) => (
 row.is_active ? (
 <span className="flex items-center gap-1.5 text-xs font-medium text-success">
 <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
 </span>
 ) : (
 <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
 <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Inactive
 </span>
 )
 ),
 },
 {
 key: 'created_at',
 header: 'Created At',
 width: 'w-28',
 render: (row) => <span className="text-xs">{formatDate(row.created_at)}</span>,
 },
 {
 key: 'actions',
 header: '',
 width: 'w-20',
 render: (row) => (
 <div className="flex items-center justify-end gap-1">
 <Link
 to={`/users/${row.id}/edit`}
 className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition duration-200 active:scale-90"
 title="Edit"
 >
 <Edit2 size={16} />
 </Link>
 {currentUser?.id !== row.id && (
 row.is_active ? (
 <button
 onClick={() => setUserToDeactivate(row.id)}
 className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition duration-200 active:scale-90"
 title="Deactivate"
 >
 <UserX size={16} />
 </button>
 ) : (
 <button
 onClick={() => handleReactivate(row.id)}
 disabled={isUpdating}
 className="rounded p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition disabled:opacity-50 disabled:cursor-not-allowed"
 title="Reactivate"
 >
 <UserCheck size={16} />
 </button>
 )
 )}
 </div>
 ),
 },
 ];

 const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0;

 return (
 <div className="space-y-5">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-foreground">Users</h2>
 {data && (
 <p className="mt-0.5 text-sm text-muted-foreground">
 {data.total} {data.total === 1 ? 'user' : 'users'} total
 </p>
 )}
 </div>
 <Link
 to="/users/create"
 className="interactive-button-small"
 >
 <span className="label">Create New</span>
 <Plus size={16} className="icon" />
 </Link>
 </div>

 {isLoading && <LoadingState />}
 {isError && <ErrorState onRetry={refetch} />}
 {!isLoading && !isError && data?.items.length === 0 && (
 <EmptyState title="No users found" description="There are no users in the system." />
 )}
 {!isLoading && !isError && data && data.items.length > 0 && (
 <>
 <DataTable columns={columns} data={data.items} keyExtractor={(r) => r.id} />
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>
 Page {data.page} of {totalPages} · {data.total} results
 </span>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
 >
 <ChevronLeft size={14} /> Prev
 </button>
 <button
 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
 disabled={page >= totalPages}
 className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
 >
 Next <ChevronRight size={14} />
 </button>
 </div>
 </div>
 </>
 )}
 
 <ConfirmModal
 isOpen={userToDeactivate !== null}
 title="Deactivate User?"
 message="Are you sure you want to deactivate this user? They will immediately lose access to the system."
 confirmText="Deactivate"
 isLoading={isDeactivating}
 onConfirm={handleDeactivate}
 onCancel={() => setUserToDeactivate(null)}
 />
 </div>
 );
}
