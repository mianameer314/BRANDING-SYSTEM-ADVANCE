import { useWorkflowItems } from '../hooks';
import { WorkflowItem } from './WorkflowItem';
import { Loader2 } from 'lucide-react';
import type { ContentStatus } from '@/types/api.types';

interface WorkflowColumnProps {
  title: string;
  status: ContentStatus | ContentStatus[];
  colorClass: string;
  search?: string;
  author?: string;
  contentType?: string;
}

export function WorkflowColumn({ title, status, colorClass, search, author, contentType }: WorkflowColumnProps) {
  // Join statuses if array
  const statusStr = Array.isArray(status) ? status.join(',') : status;
  const { data, isLoading, isError } = useWorkflowItems(1, 50, contentType, statusStr, search, author);

  const hasFilters = !!search || !!author || !!contentType;

  // Hide the column entirely if filters are applied and there are no items
  if (hasFilters && !isLoading && !isError && data?.items.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full w-[350px] shrink-0 flex-col rounded-xl border border-border bg-muted/30">
      <div className={`flex items-center justify-between border-b border-border p-4 ${colorClass} bg-opacity-10 rounded-t-xl`}>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-background px-2 text-xs font-bold shadow-sm">
          {isLoading ? '...' : data?.total || 0}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {isLoading && (
          <div className="flex justify-center p-4 text-muted-foreground">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}
        
        {isError && (
          <div className="text-sm text-destructive text-center p-4 border border-destructive/20 rounded-md bg-destructive/5">
            Failed to load items.
          </div>
        )}
        
        {!isLoading && !isError && data?.items.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-8 border border-dashed border-border rounded-lg mt-2">
            No items in this stage
          </div>
        )}
        
        {!isLoading && !isError && data?.items.map((item) => (
          <WorkflowItem key={`${item.content_type}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}
