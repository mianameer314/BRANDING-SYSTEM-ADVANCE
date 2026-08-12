import { cn } from '@/utils/utils';
import { History, GitBranch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RevisionTimelineProps {
  revisions: any[];
  selectedVersion: number | null;
  compareVersion: number | null;
  onSelect: (version: number) => void;
  onToggleCompare: (version: number) => void;
}



const actionColors: Record<string, string> = {
  update: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
  baseline: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700',
  restore: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-700',
  workflow: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-700',
};

export function RevisionTimeline({
  revisions,
  selectedVersion,
  compareVersion,
  onSelect,
  onToggleCompare,
}: RevisionTimelineProps) {
  return (
    <div className="relative border-l-2 border-border/60 ml-4 space-y-6 pb-4">
      {revisions.map((rev) => {
        const isSelected = rev.version === selectedVersion;
        const isCompare = rev.version === compareVersion;
        const isActive = isSelected || isCompare;

        return (
          <div key={rev.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div 
              className={cn(
                "absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-card transition-all duration-300 shadow-sm",
                isActive ? "border-primary scale-125" : "border-border"
              )}
            />

            {/* Content Card */}
            <div 
              className={cn(
                "group relative bg-card border rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden",
                isSelected ? "border-primary shadow-md ring-1 ring-primary/20" : 
                isCompare ? "border-amber-500 shadow-md ring-1 ring-amber-500/20" : 
                "border-border/50 hover:border-primary/40 hover:shadow-sm"
              )}
              onClick={() => onSelect(rev.version)}
            >
              {/* Active Background Glow */}
              <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
                isSelected ? "bg-primary/5 opacity-100" :
                isCompare ? "bg-amber-500/5 opacity-100" :
                "group-hover:bg-primary/[0.02] group-hover:opacity-100"
              )} />

              <div className="relative z-10 flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">v{rev.version}</span>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    actionColors[rev.action] || 'bg-muted border-border text-muted-foreground'
                  )}>
                    {rev.action}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(rev.version);
                  }}
                  className={cn(
                    "p-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5",
                    isCompare 
                      ? "bg-amber-500 text-white shadow-sm" 
                      : isSelected
                        ? "bg-primary/20 text-primary-foreground opacity-50 cursor-not-allowed"
                        : "bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                  )}
                  disabled={isSelected}
                  title={isSelected ? "Cannot compare with itself" : "Select for comparison"}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  {isCompare ? "Comparing" : "Compare"}
                </button>
              </div>

              <div className="relative z-10 space-y-2">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 opacity-70" />
                  {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-[10px] font-bold text-primary-foreground border border-primary/30 shadow-sm">
                    {rev.actor_id || 'S'}
                  </div>
                  <span className="text-xs text-muted-foreground">Actor #{rev.actor_id || 'System'}</span>
                </div>
                
                {rev.changed_fields && rev.changed_fields.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Changed Fields</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rev.changed_fields.slice(0, 3).map((f: string) => (
                        <span key={f} className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                          {f}
                        </span>
                      ))}
                      {rev.changed_fields.length > 3 && (
                        <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                          +{rev.changed_fields.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
