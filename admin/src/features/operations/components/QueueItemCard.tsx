import { cn } from "@/utils/utils";
import { formatDistanceToNow } from "date-fns";
import type { ReviewQueueItem } from "../types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { Eye, AlertTriangle, Image, Clock, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  blog: "bg-primary/10 text-primary border-primary/20",
  news: "bg-info/10 text-info border-info/20",
  project: "bg-success/10 text-success border-success/20",
  insight: "bg-warning/10 text-warning border-warning/20",
  case_study: "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog",
  news: "News",
  project: "Project",
  insight: "Insight",
  case_study: "Case Study",
};

interface QueueItemCardProps {
  item: ReviewQueueItem;
  onExpand?: (item: ReviewQueueItem) => void;
  isExpanded?: boolean;
}

export function QueueItemCard({ item, onExpand, isExpanded = false }: QueueItemCardProps) {
  const typeColor = TYPE_COLORS[item.content_type] || "bg-muted text-muted-foreground";
  const typeLabel = TYPE_LABELS[item.content_type] || item.content_type.replace("_", " ");

  // Calculate age
  const ageTime = item.status_changed_at ? new Date(item.status_changed_at) : new Date(item.updated_at);
  const age = formatDistanceToNow(ageTime, { addSuffix: true });

  // Check if has cover image for the media status display
  const hasCoverImage = !!item.cover_image;

  // Use the real validation warnings provided by backend
  const validationWarnings = item.validation_warnings || [];


  return (
    <div
      className={cn(
        "group relative flex flex-col gap-0 rounded-xl border bg-card transition-all duration-300 overflow-hidden",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-border/80 hover:-translate-y-0.5",
        isExpanded ? "border-secondary/40 ring-1 ring-secondary/10 shadow-md" : "border-border/60"
      )}
      onClick={() => onExpand?.(item)}
    >
      {/* Top Header Section */}
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", typeColor)}>
              {typeLabel}
            </span>
            <StatusBadge status={item.status} />
            {item.ai_generated && (
              <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-700">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight group-hover:text-secondary transition-colors cursor-pointer">
            {item.title}
          </h3>
        </div>
        
        <div className="flex flex-col items-end text-right flex-shrink-0">
          <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{item.author}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1" title={new Date(item.updated_at).toLocaleString()}>
            <Clock className="w-3.5 h-3.5" />
            {age}
          </span>
        </div>
      </div>

      {/* Validation Warnings Section (Only shows if there are warnings) */}
      {validationWarnings.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            {validationWarnings.map((warning, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                {warning}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="mt-auto px-5 py-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border",
              hasCoverImage ? "text-emerald-700 bg-emerald-50 border-emerald-200/60" : "text-amber-700 bg-amber-50 border-amber-200/60"
            )}>
              {hasCoverImage ? <Image className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {hasCoverImage ? "Cover Image" : "No Cover"}
            </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/operations/preview/${item.content_type}/${item.id}`}
            className="flex items-center gap-2 py-1.5 px-4 text-sm font-bold text-foreground bg-white hover:bg-muted/50 border border-border rounded-lg transition-all shadow-sm hover:shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={16} className="text-muted-foreground" />
            Preview
          </Link>
          <Link
            to={`/operations/revisions/${item.content_type}/${item.id}`}
            className="flex items-center gap-2 py-1.5 px-4 text-sm font-bold text-foreground bg-white hover:bg-muted/50 border border-border rounded-lg transition-all shadow-sm hover:shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <Clock size={16} className="text-muted-foreground" />
            History
          </Link>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.(item);
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 px-4 text-sm font-bold rounded-lg transition-all shadow-sm border",
              isExpanded 
                ? "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/90" 
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:shadow"
            )}
          >
            {isExpanded ? (
              <>
                Close
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                Review
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
