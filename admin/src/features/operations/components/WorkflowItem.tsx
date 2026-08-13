import { cn } from '@/utils/utils';
import type { ReviewQueueItem } from '../types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Lock, Eye, Clock } from 'lucide-react';

interface WorkflowItemProps {
  item: ReviewQueueItem;
}

const TYPE_COLORS: Record<string, string> = {
  blog: 'bg-primary/10 text-primary border-primary/20',
  news: 'bg-info/10 text-info border-info/20',
  project: 'bg-success/10 text-success border-success/20',
  insight: 'bg-warning/10 text-warning border-warning/20',
  case_study: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function WorkflowItem({ item }: WorkflowItemProps) {
  const { user } = useAuth();
  const typeColor = TYPE_COLORS[item.content_type] || 'bg-muted text-muted-foreground';

  // E.g. "blogs", "case-studies"
  const getEditRoute = (type: string) => {
    const map: Record<string, string> = {
      case_study: 'case-studies',
      news: 'news',
      project: 'projects', // just to be safe
    };
    return map[type] || type + 's';
  };

  const routePath = `/${getEditRoute(item.content_type)}/${item.slug}/edit`;

  const isLocked = (() => {
    if (!user) return true;
    if (item.status === 'approved' && !user.permissions.includes('approve')) return true;
    const publishStatuses = ['scheduled', 'published', 'unpublished', 'archived'];
    if (publishStatuses.includes(item.status) && !user.permissions.includes('publish')) return true;
    return false;
  })();

  return (
    <div className={cn(
      "group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all",
      !isLocked && "hover:border-primary/50 hover:shadow-md",
      isLocked && "opacity-80"
    )}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', typeColor)}>
          {item.content_type.replace('_', ' ')}
        </span>
        <StatusBadge status={item.status} />
      </div>

      {isLocked ? (
        <div className="flex items-start gap-2">
          <span className="font-semibold text-foreground line-clamp-2 text-muted-foreground cursor-not-allowed">
            {item.title}
          </span>
          <div title="Locked: You do not have permission to edit this status." className="flex items-center">
            <Lock size={14} className="text-muted-foreground shrink-0 mt-1" />
          </div>
        </div>
      ) : (
        <Link to={routePath} className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
          {item.title}
        </Link>
      )}

      <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium truncate max-w-[120px]">{item.author}</span>
          <span title={new Date(item.updated_at).toLocaleString()}>
            {new Date(item.updated_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <Link
            to={`/operations/preview/${item.content_type}/${item.id}`}
            className="group/btn flex items-center justify-center gap-2 py-1.5 px-3 flex-1 text-[13px] font-bold text-foreground bg-card hover:bg-muted border border-border rounded-lg transition-all shadow-sm hover:shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={14} className="text-muted-foreground transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-foreground" />
            Preview
          </Link>
          <Link
            to={`/operations/revisions/${item.content_type}/${item.id}`}
            className="group/btn flex items-center justify-center gap-2 py-1.5 px-3 flex-1 text-[13px] font-bold text-foreground bg-card hover:bg-muted border border-border rounded-lg transition-all shadow-sm hover:shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <Clock size={14} className="text-muted-foreground transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-foreground" />
            History
          </Link>
        </div>
      </div>
    </div>
  );
}
