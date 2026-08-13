import { cn } from "@/utils/utils";
import { AlertTriangle, AlertCircle, Eye, Clock, User, Calendar, Bot } from "lucide-react";
import type { ReviewQueueItem, QueueItemDetailData } from "../types";
import { StatusBadge } from "@/components/shared/StatusBadge";

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

interface QueueItemDetailProps {
  item: ReviewQueueItem | QueueItemDetailData;
  onClose: () => void;
  onViewFull: () => void;
}

export function QueueItemDetail({ item, onClose, onViewFull }: QueueItemDetailProps) {
  const typeColor = TYPE_COLORS[item.content_type] || "bg-muted text-muted-foreground";
  const typeLabel = TYPE_LABELS[item.content_type] || item.content_type.replace("_", " ");

  // Calculate age
  const ageTime = item.status_changed_at ? new Date(item.status_changed_at) : new Date(item.updated_at);
  const age = new Date().getTime() - ageTime.getTime();
  const days = Math.floor(age / (1000 * 60 * 60 * 24));
  const hours = Math.floor((age % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const ageStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

  const validationWarnings = item.validation_warnings || [];

  return (
    <div className="animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm", typeColor)}>
            {typeLabel}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close detail view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">{item.title}</h3>

      {/* Main info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4 bg-muted/20 rounded-xl p-5 border border-border/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Author</p>
            <p className="font-medium text-foreground">{item.author}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Age in Queue</p>
            <p className="font-medium text-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {ageStr}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status Changed</p>
            <p className="font-medium text-foreground">
              {item.status_changed_at ? new Date(item.status_changed_at).toLocaleString() : "N/A"}
            </p>
          </div>
          {item.requested_publish_date && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Requested Publish Date</p>
              <p className="font-medium text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {new Date(item.requested_publish_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {item.project_url && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Project URL</p>
              <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                {item.project_url}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4 bg-muted/20 rounded-xl p-5 border border-border/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Validation Status</p>
            <div className="flex items-center gap-2">
              {validationWarnings.length === 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-200 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All checks passed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-200 text-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {validationWarnings.length} warning(s)
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Media Status</p>
            <div className="flex items-center gap-2">
              {item.cover_image ? (
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-200 text-sm">
                  <Eye className="w-3.5 h-3.5" />
                  Cover image present
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-200 text-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Missing cover image
                </span>
              )}
              {item.media_status && (
                <span className="text-sm text-muted-foreground">
                  {item.media_status.media_count} media file(s)
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">AI Generated</p>
            <div className="flex items-center gap-2">
              {item.ai_generated ? (
                <span className="flex items-center gap-1 text-violet-600 bg-violet-50/60 px-2 py-0.5 rounded border border-violet-200 text-sm">
                  <Bot className="w-3.5 h-3.5" />
                  Yes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-200 text-sm">
                  <User className="w-3.5 h-3.5" />
                  No
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation warnings details */}
      {validationWarnings.length > 0 && (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg">
          <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Pre-Publish Validation Warnings
          </div>
          <div className="text-sm text-amber-700/90 mb-3">
            The following fields must be completed before this content can be approved or published.
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {validationWarnings.map((warning, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700/80">
                <AlertCircle className="w-3.5 h-3.5" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content preview */}
      {item.content_preview && (
        <div className="bg-muted/20 rounded-xl p-5 mb-6 border border-border/50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Content Preview</p>
          <p className="text-sm text-foreground line-clamp-3">{item.content_preview}</p>
        </div>
      )}

      {/* Owner info */}
      {item.owner_info && (
        <div className="bg-muted/20 rounded-xl p-5 mb-6 border border-border/50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Owner Information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{item.owner_info.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{item.owner_info.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium text-foreground">{item.owner_info.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/60">
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-muted/30 transition-colors"
        >
          Close
        </button>
        <button
          onClick={onViewFull}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-secondary bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] rounded-full transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
          View Full Content
        </button>
      </div>
    </div>
  );
}

// Need to import CheckCircle2
import { CheckCircle2 } from "lucide-react";
