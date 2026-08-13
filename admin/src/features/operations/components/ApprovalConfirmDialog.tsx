import { createPortal } from "react-dom";
import { cn } from "@/utils/utils";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ReviewerCommentInput } from "./ReviewerCommentInput";

type ActionType = "approve" | "request_changes" | "reject";

interface ApprovalConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionType: ActionType;
  onConfirm: () => void;
  isLoading?: boolean;
  commentValue: string;
  onCommentChange: (value: string) => void;
  reasonValue: string;
  onReasonChange: (value: string) => void;
  reasons: string[];
  requireComment: boolean;
}

const ACTION_CONFIG: Record<ActionType, { icon: any; color: string; bgColor: string; textColor: string; label: string }> = {
  approve: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
    textColor: "text-white",
    label: "Approve",
  },
  request_changes: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-500",
    textColor: "text-white",
    label: "Request Changes",
  },
  reject: {
    icon: XCircle,
    color: "text-rose-600",
    bgColor: "bg-rose-500",
    textColor: "text-white",
    label: "Reject",
  },
};

export function ApprovalConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  actionType,
  onConfirm,
  isLoading = false,
  commentValue,
  onCommentChange,
  reasonValue,
  onReasonChange,
  reasons,
  requireComment,
}: ApprovalConfirmDialogProps) {
  if (!isOpen) return null;

  const config = ACTION_CONFIG[actionType];
  const Icon = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white border border-border shadow-2xl sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className={cn("px-6 py-5 sm:flex sm:items-start gap-4", `border-b border-border/50 ${config.color}/10`)}>
          <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-current/10 sm:mx-0">
            <Icon className="h-5 w-5" style={{ color: config.color }} aria-hidden="true" />
          </div>

          <div className="mt-3 text-center sm:ml-2 sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold leading-6 text-foreground">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <ReviewerCommentInput
            value={commentValue}
            onChange={onCommentChange}
            required={requireComment}
            placeholder={
              actionType === "approve"
                ? "Optional: Add a comment about this approval..."
                : "Required: Explain what needs to be changed or why this is being rejected..."
            }
            label="Comment"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Reason (optional)</label>
            <select
              value={reasonValue}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full text-sm border border-input rounded-md bg-card text-foreground py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:bg-accent/50 transition-colors"
              disabled={isLoading}
            >
              <option value="">Select a reason...</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white/50 px-6 py-4 border-t border-border sm:flex sm:flex-row-reverse sm:gap-2">
          <button
            type="button"
            className={cn(
              "inline-flex w-full justify-center items-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-all duration-200 active:scale-95",
              `${config.bgColor} ${config.textColor} hover:brightness-95`
            )}
            onClick={onConfirm}
            disabled={isLoading || (requireComment && !commentValue.trim())}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.label}
          </button>

          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto border border-border transition-all duration-200 active:scale-95"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
