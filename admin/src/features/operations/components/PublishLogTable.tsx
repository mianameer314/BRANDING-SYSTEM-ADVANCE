import { useState } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle2, RotateCw, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { operationsApi } from "../api";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

interface PublishLogTableProps {
  items: any[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onRetrySuccess: () => void;
}

export function PublishLogTable({ items, isLoading, page, totalPages, onPageChange, onRetrySuccess }: PublishLogTableProps) {
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [resolveComment, setResolveComment] = useState("");

  const retryMutation = useMutation({
    mutationFn: async (logId: number) => {
      return operationsApi.retryPublish(logId);
    },
    onSuccess: () => {
      toast.success("Retry dispatched! Check logs in a few moments.");
      onRetrySuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to dispatch retry");
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ logId, comment }: { logId: number, comment: string }) => {
      return operationsApi.resolveFailure(logId, comment);
    },
    onSuccess: () => {
      toast.success("Webhook failure marked as resolved.");
      setResolveDialogOpen(false);
      setResolveComment("");
      onRetrySuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to resolve failure");
    }
  });

  if (isLoading) return <LoadingState message="Loading logs..." />;
  if (items.length === 0) return <EmptyState  title="No logs found" description="No webhook delivery logs match the current filters." />;

  return (
    <>
      <div className="bg-background/50 backdrop-blur border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Delivered At</th>
                <th className="px-6 py-4 font-medium">Content</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Retries</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-foreground whitespace-nowrap">
                    {format(new Date(log.delivered_at), "MMM d, HH:mm:ss")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">{log.content_type.replace('_', ' ')} #{log.content_id}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={log.request_url}>
                        {log.request_url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.success ? (
                      <span  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                      </span>
                    ) : log.resolved_at ? (
                      <span  className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <Check className="w-3 h-3 mr-1" /> Resolved
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1.5 items-start max-w-xs">
                        <span  className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border bg-red-500/10 text-red-500 border-red-500/20">
                          <AlertCircle className="w-3 h-3 mr-1" /> Failed ({log.response_status || "ERR"})
                        </span>
                        {log.error_message && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100/50 w-full break-words max-h-24 overflow-y-auto shadow-inner leading-relaxed">
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {log.retry_count > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> {log.retry_count}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!log.success && !log.resolved_at && (
                        <>
                          <button type="button" 
                            className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-foreground bg-white hover:bg-muted/50 border border-border rounded-lg transition-all shadow-sm hover:shadow"
                            onClick={() => retryMutation.mutate(log.id)}
                            disabled={retryMutation.isPending && retryMutation.variables === log.id}
                          >
                            {(retryMutation.isPending && retryMutation.variables === log.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground group-hover/btn:text-foreground" />
                            ) : (
                              <RotateCw className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover/btn:rotate-180 group-hover/btn:text-foreground" />
                            )}
                            Retry
                          </button>
                          <button type="button" 
                            className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setSelectedLogId(log.id);
                              setResolveDialogOpen(true);
                            }}
                          >
                            <Check className="w-4 h-4 text-amber-500 transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-amber-700" />
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/10">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="space-x-2">
              <button type="button"
                
                
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button type="button"
                
                
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={resolveDialogOpen ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200" : "hidden"}>
        <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl max-w-md w-full border border-border/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/60 via-amber-500 to-amber-500/60" />

          <div className="mb-2 mt-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                <Check className="w-5 h-5" />
              </div>
              Resolve Failure Manually
            </h2>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
              Marking this failure as resolved will stop any further automated alerts or retries. Please provide a reason below.
            </p>
          </div>
          
          <div className="py-5">
            <textarea 
              placeholder="E.g. Manually triggered build in Vercel instead."
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all outline-none resize-none shadow-sm"
              rows={4}
            />
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setResolveDialogOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-white border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedLogId) {
                  resolveMutation.mutate({ logId: selectedLogId, comment: resolveComment });
                }
              }}
              disabled={resolveMutation.isPending || !resolveComment.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {resolveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Confirm Resolution
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
