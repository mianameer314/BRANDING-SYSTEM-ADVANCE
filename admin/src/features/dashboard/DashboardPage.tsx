import { 
  FileText, 
  Newspaper, 
  Briefcase, 
  Lightbulb, 
  Trophy,
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
import { cn } from '@/utils/utils';
import { Link } from 'react-router-dom';
import { CountUp } from '@/components/ui/CountUp';
import { useDashboardStats } from './hooks';
import { useWorkflowOverview } from '@/features/operations/hooks';
import { WorkflowStageCard } from '@/features/operations/components/WorkflowStageCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/providers/AuthProvider';
import { PermissionGuard } from '@/features/auth/components/PermissionGuard';

const STATUS_DOT_COLORS: Record<string, string> = {
  published: 'bg-emerald-500',
  draft: 'bg-slate-500',
  in_review: 'bg-amber-500',
  changes_requested: 'bg-rose-500',
  approved: 'bg-cyan-500',
  scheduled: 'bg-fuchsia-500',
  unpublished: 'bg-orange-500',
  archived: 'bg-zinc-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  changes_requested: 'Changes',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  unpublished: 'Unpublished',
  archived: 'Archived',
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  stats: Record<string, number> | undefined;
  isLoading: boolean;
  color: string;
  to: string;
}

function StatCard({ icon: Icon, label, stats, isLoading, color, to }: StatCardProps) {
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : undefined;
  const sortedStatuses = stats ? Object.entries(stats).sort((a, b) => b[1] - a[1]) : [];

  return (
    <Link
      to={to}
      className="o2-card-3d group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:bg-accent flex flex-col justify-between"
    >
      <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', color)} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {isLoading ? (
              <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-accent" />
            ) : (
              total !== undefined ? <CountUp end={total} /> : '0'
            )}
          </p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', color, 'bg-opacity-15')}>
          <Icon size={20} className={cn(color.replace('bg-', 'text-'))} />
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground border-t border-border pt-4 min-h-[3rem]">
        {!isLoading && sortedStatuses.map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', STATUS_DOT_COLORS[status] || 'bg-muted')} />
            <span>{STATUS_LABELS[status] || status}: <strong className="text-foreground">{count}</strong></span>
          </div>
        ))}
        {!isLoading && sortedStatuses.length === 0 && (
          <div className="text-muted-foreground/50 text-xs">No content found</div>
        )}
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { data: dashboardStats, isLoading: isDashboardLoading } = useDashboardStats();
  const { data: overview, isLoading: isOperationsLoading, refetch, isFetching } = useWorkflowOverview();
  const { user } = useAuth();
  
  const canApprove = user?.permissions?.includes('approve');
  const canPublish = user?.permissions?.includes('publish');
  
  const isLocked = (status: string) => {
    if (status === 'approved') return !canApprove;
    if (['published', 'scheduled', 'unpublished', 'archived'].includes(status)) return !canPublish;
    return false;
  };

  const contentTypes: StatCardProps[] = [
    { icon: FileText, label: 'Total Blogs', stats: dashboardStats?.blogs, isLoading: isDashboardLoading, color: 'bg-primary', to: '/blogs' },
    { icon: Newspaper, label: 'Total News', stats: dashboardStats?.news, isLoading: isDashboardLoading, color: 'bg-info', to: '/news' },
    { icon: Briefcase, label: 'Total Projects', stats: dashboardStats?.projects, isLoading: isDashboardLoading, color: 'bg-success', to: '/projects' },
    { icon: Lightbulb, label: 'Total Insights', stats: dashboardStats?.insights, isLoading: isDashboardLoading, color: 'bg-warning', to: '/insights' },
    { icon: Trophy, label: 'Case Studies', stats: dashboardStats?.case_studies, isLoading: isDashboardLoading, color: 'bg-destructive', to: '/case-studies' },
  ];

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
    <div className="space-y-8 pb-8">
      {/* Main Header */}
      <div className="relative flex flex-col items-center text-center gap-4 py-2 sm:py-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard & Console</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Monitor and manage the entire editorial workflow.
          </p>
        </div>
        <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
          <PermissionGuard permission="view_drafts">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </PermissionGuard>
        </div>
      </div>

      <PermissionGuard permission="view_drafts">
        {/* Summary Bar */}
        <div className="flex justify-center w-full py-4 mb-4">
          <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-card/50 px-16 py-10 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/40 min-w-[320px]">
            {/* Glow Accent */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Managed Content</span>
              <span className="text-6xl font-black text-foreground drop-shadow-sm">
                {isOperationsLoading ? (
                  <span className="inline-block h-14 w-24 animate-pulse rounded-lg bg-accent" />
                ) : (
                  <CountUp end={overview?.total_content || 0} />
                )}
              </span>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Content Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Content Types Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contentTypes.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      <PermissionGuard permission="view_drafts">
        {/* Operations Pipeline (Stage Grid) */}
        <div className="space-y-4 border-t border-border pt-8 mt-8">
          <h3 className="text-lg font-semibold text-foreground">Operations Pipeline</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage) => {
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
                  isLoading={isOperationsLoading}
                  isLocked={isLocked(stage.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-4 border-t border-border pt-8 mt-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border p-4 bg-muted/10">
              <Activity size={18} className="text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="flex flex-col">
              {isOperationsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading activity...</div>
              ) : !overview?.recent_activity || overview.recent_activity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent activity.</div>
              ) : (
                <div className="divide-y divide-border">
                  {overview.recent_activity.map((item) => {
                    const getEditRoute = (type: string) => {
                      const map: Record<string, string> = { 
                        case_study: 'case-studies',
                        news: 'news',
                        project: 'projects'
                      };
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
      </PermissionGuard>
    </div>
  );
}
