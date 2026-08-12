import { 
  PenTool, 
  ClipboardCheck, 
  CheckCircle2, 
  CalendarClock, 
  Globe2, 
  ZapOff,
  RefreshCw,
  Archive,
  EyeOff,
  FileWarning,
  Activity
} from 'lucide-react';
import { useWorkflowOverview } from '../hooks';
import { WorkflowStageCard } from '../components/WorkflowStageCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Link } from 'react-router-dom';

export function OperationsConsolePage() {
  const { data: overview, isLoading, refetch, isFetching } = useWorkflowOverview();

  const stages = [
    {
      id: 'draft',
      title: 'Drafts',
      description: 'Content currently being written or edited.',
      icon: PenTool,
      color: 'bg-slate-500',
      textColor: 'text-slate-500',
      linkTo: '/operations/workflow?status=draft',
    },
    {
      id: 'in_review',
      title: 'Review Queue',
      description: 'Content awaiting editorial approval.',
      icon: ClipboardCheck,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      linkTo: '/operations/workflow?status=in_review',
    },
    {
      id: 'changes_requested',
      title: 'Changes Requested',
      description: 'Returned to author for revisions.',
      icon: FileWarning,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      linkTo: '/operations/workflow?status=changes_requested',
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Ready to be scheduled or published.',
      icon: CheckCircle2,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      linkTo: '/operations/workflow?status=approved',
    },
    {
      id: 'scheduled',
      title: 'Scheduled',
      description: 'Set to automatically publish at a future date.',
      icon: CalendarClock,
      color: 'bg-fuchsia-500',
      textColor: 'text-fuchsia-500',
      linkTo: '/operations/workflow?status=scheduled',
    },
    {
      id: 'published',
      title: 'Published',
      description: 'Live on the public website.',
      icon: Globe2,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      linkTo: '/operations/workflow?status=published',
    },
    {
      id: 'unpublished',
      title: 'Unpublished',
      description: 'Taken offline but kept for reference.',
      icon: EyeOff,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      linkTo: '/operations/workflow?status=unpublished',
    },
    {
      id: 'archived',
      title: 'Archived',
      description: 'Retired and hidden content.',
      icon: Archive,
      color: 'bg-zinc-600',
      textColor: 'text-zinc-600',
      linkTo: '/operations/workflow?status=archived',
    },
    {
      id: 'failed',
      title: 'Integration Issues',
      description: 'Failed webhooks or delivery errors requiring attention.',
      icon: ZapOff,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      linkTo: '/webhooks',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Operations Console</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage the entire editorial workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Total Managed Content</span>
            <span className="text-2xl font-bold">
              {isLoading ? '...' : overview?.total_content || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => {
          // 'failed' is a placeholder for webhook failures, we don't have a content status for it
          const count = stage.id === 'failed' ? overview?.failed_webhooks : overview?.stages[stage.id]?.total;
          const breakdown = stage.id === 'failed' ? undefined : overview?.stages[stage.id]?.by_type;
          
          return (
            <WorkflowStageCard
              key={stage.id}
              title={stage.title}
              description={stage.description}
              icon={stage.icon}
              color={stage.color}
              textColor={stage.textColor}
              linkTo={stage.linkTo}
              count={count}
              breakdown={breakdown}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-4 bg-muted/10">
          <Activity size={18} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading activity...</div>
          ) : !overview?.recent_activity || overview.recent_activity.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="divide-y divide-border">
              {overview.recent_activity.map((item) => {
                const getEditRoute = (type: string) => {
                  const map: Record<string, string> = { case_study: 'case-studies' };
                  return map[type] || type + 's';
                };
                const routePath = `/${getEditRoute(item.content_type)}/${item.slug}/edit`;

                return (
                  <div key={`${item.content_type}-${item.id}`} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">
                        {item.content_type.replace('_', ' ')}
                      </span>
                      <div className="flex flex-col gap-1">
                        <Link to={routePath} className="font-medium text-foreground hover:text-primary transition-colors">
                          {item.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Updated by {item.author} • {new Date(item.status_changed_at || item.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
