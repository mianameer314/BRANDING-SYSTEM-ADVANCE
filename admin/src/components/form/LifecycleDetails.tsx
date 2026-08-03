import type { LifecycleAuditFields } from '@/types/api.types';
import { useUser } from '@/features/users/hooks';

interface LifecycleDetailsProps {
 audit: LifecycleAuditFields;
}

function formatDate(value: string | null) {
 if (!value) return 'Not recorded yet';
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LifecycleDetails({ audit }: LifecycleDetailsProps) {
 const { data: user, isLoading } = useUser(audit.status_changed_by_id || 0);

 const changedByDisplay = audit.status_changed_by_id
   ? isLoading 
     ? `Loading... (ID: ${audit.status_changed_by_id})` 
     : user 
       ? `${user.full_name} (ID: ${user.id})` 
       : `Unknown User (ID: ${audit.status_changed_by_id})`
   : 'Not recorded yet';

 return (
 <section className="border-t border-border pt-5 text-sm">
 <h2 className="font-medium text-foreground">Lifecycle details</h2>
 <dl className="mt-3 space-y-2 text-muted-foreground">
 <div><dt className="inline font-medium text-foreground">Last changed:</dt> <dd className="inline">{formatDate(audit.status_changed_at)}</dd></div>
 <div><dt className="inline font-medium text-foreground">Changed by:</dt> <dd className="inline">{changedByDisplay}</dd></div>
 <div><dt className="font-medium text-foreground">Reason:</dt><dd className="mt-1 whitespace-pre-wrap">{audit.status_change_reason || 'Not recorded yet'}</dd></div>
 </dl>
 </section>
 );
}
