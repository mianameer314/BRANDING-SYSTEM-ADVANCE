import { Link } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { CountUp } from '@/components/ui/CountUp';
import { ArrowRight } from 'lucide-react';

interface WorkflowStageCardProps {
  title: string;
  description: string;
  count: number | undefined;
  icon: React.ElementType;
  color: string;
  textColor: string;
  isLoading?: boolean;
  linkTo: string;
  breakdown?: Record<string, number>;
}

export function WorkflowStageCard({
  title,
  description,
  count,
  icon: Icon,
  color,
  textColor,
  isLoading,
  linkTo,
  breakdown,
}: WorkflowStageCardProps) {
  // Sort breakdown by count descending
  const sortedBreakdown = breakdown
    ? Object.entries(breakdown)
        .filter(([_, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="o2-card-3d group relative overflow-hidden rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
      {/* Glow accent */}
      <div className={cn('absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity', color)} />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className={cn("text-lg font-semibold", textColor)}>{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="mt-4 text-4xl font-bold text-foreground">
            {isLoading ? (
              <span className="inline-block h-10 w-20 animate-pulse rounded-lg bg-accent" />
            ) : (
              count !== undefined ? <CountUp end={count} /> : '0'
            )}
          </p>
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', color, 'bg-opacity-15')}>
          <Icon size={24} className={textColor} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex gap-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {isLoading ? (
            <span className="inline-block h-4 w-24 animate-pulse rounded bg-accent" />
          ) : sortedBreakdown.length > 0 ? (
            sortedBreakdown.slice(0, 3).map(([type, val]) => (
              <span key={type}>
                {type}: <span className="text-foreground">{val}</span>
              </span>
            ))
          ) : (
            <span>No items</span>
          )}
        </div>
        
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
