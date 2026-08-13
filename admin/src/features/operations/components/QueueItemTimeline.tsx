import { cn } from "@/utils/utils";
import { GitBranch, User, Clock, AlertCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTION_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  baseline: { label: "Created", color: "bg-emerald-500 text-white", icon: CheckCircle2 },
  update: { label: "Updated", color: "bg-amber-500 text-white", icon: RotateCcw },
  status_changed: { label: "Status Changed", color: "bg-violet-500 text-white", icon: GitBranch },
  restore: { label: "Restored", color: "bg-cyan-500 text-white", icon: RotateCcw },
  workflow: { label: "Workflow", color: "bg-fuchsia-500 text-white", icon: GitBranch },
  approved: { label: "Approved", color: "bg-emerald-500 text-white", icon: CheckCircle2 },
  changes_requested: { label: "Changes Requested", color: "bg-amber-500 text-white", icon: AlertCircle },
  rejected: { label: "Rejected", color: "bg-rose-500 text-white", icon: XCircle },
};

interface TimelineEvent {
  event: string;
  timestamp: string;
  actor: string;
  details?: string;
  action?: string;
}

interface QueueItemTimelineProps {
  timeline: TimelineEvent[];
  revisions?: Array<{
    version: number;
    action: string;
    actor_name: string;
    created_at: string;
    changed_fields: string[];
  }>;
}

export function QueueItemTimeline({ timeline = [], revisions = [] }: QueueItemTimelineProps) {
  // Combine timeline and revisions into a single sorted list
  const allEvents: Array<{
    timestamp: string;
    type: "timeline" | "revision";
    data: TimelineEvent | (typeof revisions)[0];
  }> = [
    ...timeline.map((t) => ({
      timestamp: t.timestamp,
      type: "timeline" as const,
      data: t,
    })),
    ...revisions.map((r) => ({
      timestamp: r.created_at,
      type: "revision" as const,
      data: r,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline events available</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-border/60 ml-4 space-y-6 pb-4">
      {allEvents.map((event, index) => {
        const isLatest = index === 0;
        const eventData = event.data;
        
        if (event.type === "revision") {
          const rev = eventData as typeof revisions[0];
          const actionInfo = ACTION_LABELS[rev.action] || { label: rev.action, color: "bg-muted text-muted-foreground", icon: GitBranch };
          const Icon = actionInfo.icon;
          const actorName = rev.actor_name || "System";

          return (
            <div key={`rev-${rev.version}`} className="relative pl-6">
              <div className={cn("absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-card transition-all duration-300 shadow-sm", isLatest ? "border-primary scale-125 bg-primary" : "border-border")} />
              
              <div className={cn(
                "group relative bg-card border rounded-xl p-4 transition-all duration-300",
                isLatest ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border/50 hover:border-primary/40 hover:shadow-sm"
              )}>
                <div className="relative z-10 flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">v{rev.version}</span>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", actionInfo.color)}>
                      <Icon className="w-3 h-3 inline mr-1" />
                      {actionInfo.label}
                    </span>
                    {isLatest && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative z-10 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground/80">{actorName}</span>
                  </div>

                  {rev.changed_fields && rev.changed_fields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Changed Fields</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rev.changed_fields.slice(0, 5).map((f: string) => (
                          <span key={f} className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                            {f}
                          </span>
                        ))}
                        {rev.changed_fields.length > 5 && (
                          <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                            +{rev.changed_fields.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        } else {
          const tl = eventData as TimelineEvent;
          const actionInfo = ACTION_LABELS[tl.event] || { label: tl.event, color: "bg-muted text-muted-foreground", icon: GitBranch };
          const Icon = actionInfo.icon;

          return (
            <div key={`tl-${index}`} className="relative pl-6">
              <div className={cn("absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-card transition-all duration-300 shadow-sm", isLatest ? "border-primary scale-125 bg-primary" : "border-border")} />
              
              <div className={cn(
                "group relative bg-card border rounded-xl p-4 transition-all duration-300",
                isLatest ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border/50 hover:border-primary/40 hover:shadow-sm"
              )}>
                <div className="relative z-10 flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{tl.event}</span>
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", actionInfo.color)}>
                      <Icon className="w-3 h-3 inline mr-1" />
                      {actionInfo.label}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(tl.timestamp), { addSuffix: true })}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground/80">{tl.actor}</span>
                  </div>

                  {tl.details && (
                    <div className="mt-2 p-2 bg-muted/30 rounded text-sm text-foreground/80">
                      {tl.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
