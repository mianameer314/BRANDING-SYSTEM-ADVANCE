import { FileText, Newspaper, Briefcase, Lightbulb, Trophy } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Link } from 'react-router-dom';
import { CountUp } from '@/components/ui/CountUp';
import { useDashboardStats } from './hooks';

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
  // Sort statuses to put published first, then others
  const sortedStatuses = stats ? Object.entries(stats).sort((a, b) => b[1] - a[1]) : [];

  return (
    <Link
      to={to}
      className="o2-card-3d group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:bg-accent flex flex-col justify-between"
    >
      {/* Glow accent */}
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

      {/* Breakdowns */}
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
  const { data: dashboardStats, isLoading } = useDashboardStats();

  const stats: StatCardProps[] = [
    { icon: FileText, label: 'Total Blogs', stats: dashboardStats?.blogs, isLoading, color: 'bg-primary', to: '/blogs' },
    { icon: Newspaper, label: 'Total News', stats: dashboardStats?.news, isLoading, color: 'bg-info', to: '/news' },
    { icon: Briefcase, label: 'Total Projects', stats: dashboardStats?.projects, isLoading, color: 'bg-success', to: '/projects' },
    { icon: Lightbulb, label: 'Total Insights', stats: dashboardStats?.insights, isLoading, color: 'bg-warning', to: '/insights' },
    { icon: Trophy, label: 'Case Studies', stats: dashboardStats?.case_studies, isLoading, color: 'bg-destructive', to: '/case-studies' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live content counts from your backend.
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
