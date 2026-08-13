import { useState } from "react";
import { cn } from "@/utils/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { ReviewQueueItem, ApprovalActionPayload, ChangeRequestPayload, RejectionPayload } from "../types";
import { ApprovalConfirmDialog } from "./ApprovalConfirmDialog";

const ACTION_REASONS = [
  "Needs more detail",
  "Missing images",
  "SEO needs work",
  "Factual errors",
  "Style/tone issues",
  "Incomplete sections",
  "Other",
];

interface ApprovalActionPanelProps {
  item: ReviewQueueItem;
  onApprove: (data: ApprovalActionPayload) => void;
  onRequestChanges: (data: ChangeRequestPayload) => void;
  onReject: (data: RejectionPayload) => void;
  isLoading?: boolean;
}

export function ApprovalActionPanel({
  item,
  onApprove,
  onRequestChanges,
  onReject,
  isLoading = false,
}: ApprovalActionPanelProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [approveReason, setApproveReason] = useState("");
  const [requestChangesComment, setRequestChangesComment] = useState("");
  const [requestChangesReason, setRequestChangesReason] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    onApprove({
      content_type: item.content_type,
      content_id: item.id,
      comment: approveComment || undefined,
      reason: approveReason || undefined,
    });
    setShowApproveDialog(false);
    setApproveComment("");
    setApproveReason("");
  };

  const handleRequestChanges = () => {
    onRequestChanges({
      content_type: item.content_type,
      content_id: item.id,
      comment: requestChangesComment,
      reason: requestChangesReason || undefined,
    });
    setShowRequestChangesDialog(false);
    setRequestChangesComment("");
    setRequestChangesReason("");
  };

  const handleReject = () => {
    onReject({
      content_type: item.content_type,
      content_id: item.id,
      comment: rejectComment,
      reason: rejectReason || undefined,
    });
    setShowRejectDialog(false);
    setRejectComment("");
    setRejectReason("");
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Actions
      </div>

      <div className="flex flex-col gap-2">
        {/* Approve Button */}
        <div className="relative">
          <button
            onClick={() => setShowApproveDialog(true)}
            disabled={isLoading || item.status === "approved" || item.status.toLowerCase() === "changes_requested"}
            className={cn(
              "peer w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all",
              "bg-emerald-500/10 text-emerald-700 border border-emerald-200 hover:bg-emerald-500/20 hover:shadow-sm hover:-translate-y-0.5",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            )}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">Approve</span>
            <span className="text-xs text-emerald-600/70">Publish ready</span>
          </button>
          {item.status.toLowerCase() === "changes_requested" && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-50">
              Awaiting author changes
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
            </div>
          )}
        </div>

        {/* Request Changes Button */}
        <div className="relative">
          <button
            onClick={() => setShowRequestChangesDialog(true)}
            disabled={isLoading || item.status.toLowerCase() === "changes_requested"}
            className={cn(
              "peer w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all",
              "bg-amber-500/10 text-amber-700 border border-amber-200 hover:bg-amber-500/20 hover:shadow-sm hover:-translate-y-0.5",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            )}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">Request Changes</span>
            <span className="text-xs text-amber-600/70">Send back to author</span>
          </button>
          {item.status.toLowerCase() === "changes_requested" && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-50">
              Changes already requested
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
            </div>
          )}
        </div>

        {/* Reject Button */}
        <button
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading || item.status === "archived"}
          className={cn(
            "w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all",
            "bg-rose-500/10 text-rose-700 border border-rose-200 hover:bg-rose-500/20 hover:shadow-sm hover:-translate-y-0.5",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          )}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">Reject</span>
          <span className="text-xs text-rose-600/70">Archive content</span>
        </button>
      </div>

      {/* Approve Confirmation Dialog */}
      <ApprovalConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        title="Approve Content"
        message="Are you sure you want to approve this content? It will move to the approved status and be ready for scheduling or publishing."
        actionType="approve"
        onConfirm={handleApprove}
        isLoading={isLoading}
        commentValue={approveComment}
        onCommentChange={setApproveComment}
        reasonValue={approveReason}
        onReasonChange={setApproveReason}
        reasons={ACTION_REASONS}
        requireComment={false}
      />

      {/* Request Changes Confirmation Dialog */}
      <ApprovalConfirmDialog
        isOpen={showRequestChangesDialog}
        onClose={() => setShowRequestChangesDialog(false)}
        title="Request Changes"
        message="This will send the content back to the author with your feedback. The author will need to address your comments before resubmitting for review."
        actionType="request_changes"
        onConfirm={handleRequestChanges}
        isLoading={isLoading}
        commentValue={requestChangesComment}
        onCommentChange={setRequestChangesComment}
        reasonValue={requestChangesReason}
        onReasonChange={setRequestChangesReason}
        reasons={ACTION_REASONS}
        requireComment={true}
      />

      {/* Reject Confirmation Dialog */}
      <ApprovalConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        title="Reject Content"
        message="This will archive the content and it will no longer appear in the review queue. This action requires a reason."
        actionType="reject"
        onConfirm={handleReject}
        isLoading={isLoading}
        commentValue={rejectComment}
        onCommentChange={setRejectComment}
        reasonValue={rejectReason}
        onReasonChange={setRejectReason}
        reasons={ACTION_REASONS}
        requireComment={true}
      />
    </div>
  );
}
