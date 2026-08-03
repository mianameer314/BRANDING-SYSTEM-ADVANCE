import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
 title?: string;
 description?: string;
 action?: ReactNode;
}

export function EmptyState({
 title = 'No content yet',
 description = 'Nothing to show here. Content will appear once it is created.',
 action,
}: EmptyStateProps) {
 return (
 <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background py-20 text-center">
 <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-muted-foreground">
 <Inbox size={28} />
 </div>
 <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
 <p className="mb-6 max-w-xs text-sm text-muted-foreground">{description}</p>
 {action}
 </div>
 );
}
