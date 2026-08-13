import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { CalendarClock, Clock, XCircle, AlertTriangle, Loader2, RefreshCw, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { operationsApi } from "../api";
import { QueueFilterBar } from "../components/QueueFilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ScheduleConfirmDialog } from "../components/ScheduleConfirmDialog";

export function SchedulePublishPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setHeaderState } = useOutletContext<any>();

  useEffect(() => {
    setHeaderState({
      title: 'Schedule Publish',
      subtitle: 'Manage upcoming scheduled publications or schedule approved content.',
      showBackButton: false
    });
  }, [setHeaderState]);

  const [page, setPage] = useState(1);
  const perPage = 20;
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState<any>(null);
  const [publishNowItem, setPublishNowItem] = useState<any>(null);

  const filters = useMemo(() => ({
    content_type: searchParams.get("content_type") || undefined,
    search: searchParams.get("search") || undefined,
  }), [searchParams]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['schedule-queue', page, perPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (filters.content_type) params.append('content_type', filters.content_type);
      if (filters.search) params.append('search', filters.search);
      
      const res = await operationsApi.getScheduleQueue(params);
      return res;
    },
    refetchInterval: 15000,
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ contentType, contentId, date, isReschedule }: any) => {
      return isReschedule ? operationsApi.rescheduleContent({ content_type: contentType, content_id: contentId, scheduled_at: date.toISOString() }) : operationsApi.scheduleContent({ content_type: contentType, content_id: contentId, scheduled_at: date.toISOString() });
    },
    onSuccess: () => {
      toast.success("Content scheduled successfully");
      queryClient.invalidateQueries({ queryKey: ['schedule-queue'] });
      setScheduleDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to schedule content");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: ({ contentType, contentId }: { contentType: string, contentId: number }) =>
      operationsApi.cancelSchedule({ content_type: contentType, content_id: contentId }),
    onSuccess: () => {
      toast.success("Schedule cancelled. Content is back to Approved.");
      setCancelItem(null);
      queryClient.invalidateQueries({ queryKey: ["schedule-queue"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to cancel schedule");
    }
  });

  const publishNowMutation = useMutation({
    mutationFn: ({ contentType, contentId }: { contentType: string, contentId: number }) =>
      operationsApi.publishNow({ content_type: contentType, content_id: contentId }),
    onSuccess: () => {
      toast.success("Content published immediately!");
      setPublishNowItem(null);
      queryClient.invalidateQueries({ queryKey: ["schedule-queue"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to publish content");
    }
  });

  const handleFilterChange = (newFilters: any) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState message={(error as Error).message} 
        />
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <QueueFilterBar 
            filters={filters}
            onChange={(key, val) => handleFilterChange({ ...filters, [key]: val })}
            onReset={() => handleFilterChange({ content_type: undefined, search: undefined })}
            totalCount={data?.total || 0}
            hideAiFilter={true}
          />
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border shadow-sm rounded-xl text-sm font-bold text-foreground hover:bg-muted/50 transition-all hover:shadow active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin text-primary' : ''}`} />
          Refresh Queue
        </button>
      </div>
      
      {isLoading ? (
        <LoadingState message="Loading schedule queue..." />
      ) : items.length === 0 ? (
        <EmptyState 
          
          title="No content to schedule" 
          description="There is no approved content waiting to be scheduled." 
        />
      ) : (
        <div className="bg-background/50 backdrop-blur border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Content</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Scheduled For</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {items.map((item: any) => (
                  <tr key={`${item.content_type}-${item.id}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">
                      {item.content_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'scheduled' ? (
                        <span  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Scheduled
                        </span>
                      ) : (
                        <span  className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.scheduled_at ? format(new Date(item.scheduled_at), "PPP p") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'scheduled' ? (
                          <>
                            <button type="button" 
                              className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-foreground bg-white hover:bg-muted/50 border border-border rounded-lg transition-all shadow-sm hover:shadow"
                              onClick={() => {
                                setSelectedItem(item);
                                setScheduleDialogOpen(true);
                              }}
                            >
                              <Clock className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-foreground" />
                              Reschedule
                            </button>
                            <button type="button" 
                              className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-all shadow-sm hover:shadow"
                              onClick={() => setCancelItem(item)}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 text-red-400 transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-red-600" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" 
                              className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-foreground bg-white hover:bg-muted/50 border border-border rounded-lg transition-all shadow-sm hover:shadow"
                              onClick={() => {
                                setSelectedItem(item);
                                setScheduleDialogOpen(true);
                              }}
                            >
                              <CalendarClock className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-foreground" />
                              Schedule
                            </button>
                            <button type="button" 
                              className="group/btn flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 hover:border-emerald-700 rounded-lg transition-all shadow-sm hover:shadow"
                              onClick={() => setPublishNowItem(item)}
                              disabled={publishNowMutation.isPending}
                            >
                              <Send className="w-4 h-4 text-emerald-100 transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:text-white" />
                              Publish Now
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
                  
                  
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button type="button"
                  
                  
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <ScheduleConfirmDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onConfirm={(date) => {
            scheduleMutation.mutate({
              contentType: selectedItem.content_type,
              contentId: selectedItem.id,
              date,
              isReschedule: selectedItem.status === 'scheduled'
            });
          }}
          isLoading={scheduleMutation.isPending}
          title={selectedItem.status === 'scheduled' ? "Reschedule Content" : "Schedule Content"}
        />
      )}

      {cancelItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200">
          <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-border/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cancel Schedule?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to cancel this scheduled publish? The content will revert to the <strong>Approved</strong> state.
              </p>
            </div>
            
            <div className="flex justify-stretch gap-3 w-full">
              <button 
                onClick={() => setCancelItem(null)}
                disabled={cancelMutation.isPending}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm border border-input bg-background hover:bg-accent transition-all disabled:opacity-50"
              >
                Keep Schedule
              </button>
              <button 
                onClick={() => cancelMutation.mutate({ contentType: cancelItem.content_type, contentId: cancelItem.id })}
                disabled={cancelMutation.isPending}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-all shadow hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={publishNowItem ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200" : "hidden"}>
        <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl max-w-md w-full border border-border/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 via-emerald-500 to-emerald-500/60" />

          <div className="mb-2 mt-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-3 text-emerald-600">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                <Send className="w-5 h-5" />
              </div>
              Confirm Immediate Publish
            </h2>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
              Are you sure you want to publish <strong>{publishNowItem?.title || `${publishNowItem?.content_type} ${publishNowItem?.id}`}</strong> right now?
            </p>
          </div>
          
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100 my-6 leading-relaxed">
            This action will bypass scheduling, immediately push this content live, and fire all configured webhooks instantly.
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setPublishNowItem(null)}
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-white border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (publishNowItem) {
                  publishNowMutation.mutate({
                    contentType: publishNowItem.content_type,
                    contentId: publishNowItem.id,
                  });
                }
              }}
              disabled={publishNowMutation.isPending}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {publishNowMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Yes, Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
