import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ChevronLeft, ClipboardCheck, ChevronRight } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { operationsApi } from "../api";
import { QueueFilterBar } from "../components/QueueFilterBar";
import { QueueItemCard } from "../components/QueueItemCard";
import { QueueItemDetail } from "../components/QueueItemDetail";
import { QueueItemTimeline } from "../components/QueueItemTimeline";
import { ApprovalActionPanel } from "../components/ApprovalActionPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { cn } from "@/utils/utils";
import type { ReviewQueueItem, ReviewQueueFilters } from "../types";
import { useReviewQueue, useApproveContent, useRequestChanges, useRejectContent } from "../hooks";

const SORT_OPTIONS = [
  { value: "age", label: "Age (Oldest First)" },
  { value: "age_desc", label: "Age (Newest First)" },
  { value: "content_type", label: "Content Type" },
  { value: "author", label: "Author" },
  { value: "requested_date", label: "Requested Date" },
];

function ExpandedQueueItemView({ item, onClose, onViewFull, onApprove, onRequestChanges, onReject, isMutating }: any) {
  const { data: revisionsData, isLoading: isLoadingRevisions } = useQuery<any>({
    queryKey: ['revisions', item.content_type, item.id],
    queryFn: () => operationsApi.getRevisions(item.content_type, item.id)
  });

  const revisions = revisionsData?.items || revisionsData || [];

  return (
    <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QueueItemDetail
              item={item}
              onClose={onClose}
              onViewFull={onViewFull}
            />

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Timeline & History
              </h4>
              {isLoadingRevisions ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading timeline...
                </div>
              ) : (
                <QueueItemTimeline
                  timeline={[]}
                  revisions={revisions}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ApprovalActionPanel
              item={item}
              onApprove={onApprove}
              onRequestChanges={onRequestChanges}
              onReject={onReject}
              isLoading={isMutating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


export function ApprovalQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // State
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("age");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Filters from URL
  const filters: ReviewQueueFilters = useMemo(() => ({
    page,
    per_page: perPage,
    content_type: searchParams.get("content_type") || undefined,
    author: searchParams.get("author") || undefined,
    search: searchParams.get("search") || undefined,
    ai_generated: searchParams.get("ai_generated") === "true" || undefined,
  }), [searchParams, page]);

  // Mutations
  const approveMutation = useApproveContent();
  const requestChangesMutation = useRequestChanges();
  const rejectMutation = useRejectContent();

  const isMutating = approveMutation.isPending || requestChangesMutation.isPending || rejectMutation.isPending;

  // Fetch review queue
  const { data, isLoading, error } = useReviewQueue(filters) as any;

  // Handle filter changes
  const handleFilterChange = (key: keyof ReviewQueueFilters, value: any) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handleFilterReset = () => {
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["operations", "review-queue"] });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

  // Sort items
  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => {
      switch (sortBy) {
        case "age":
          return new Date(a.status_changed_at || a.updated_at).getTime() - new Date(b.status_changed_at || b.updated_at).getTime();
        case "age_desc":
          return new Date(b.status_changed_at || b.updated_at).getTime() - new Date(a.status_changed_at || a.updated_at).getTime();
        case "content_type":
          return a.content_type.localeCompare(b.content_type);
        case "author":
          return a.author.localeCompare(b.author);
        case "requested_date":
          if (!a.published_at && !b.published_at) return 0;
          if (!a.published_at) return 1;
          if (!b.published_at) return -1;
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
        default:
          return 0;
      }
    });
  }, [data?.items, sortBy]);

  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / perPage);

  const handleApprove = async (item: ReviewQueueItem) => {
    try {
      await approveMutation.mutateAsync({
        content_type: item.content_type,
        content_id: item.id,
      });
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleRequestChanges = async (item: ReviewQueueItem, comment: string) => {
    try {
      await requestChangesMutation.mutateAsync({
        content_type: item.content_type,
        content_id: item.id,
        comment,
      });
    } catch (err) {
      console.error("Failed to request changes:", err);
    }
  };

  const handleReject = async (item: ReviewQueueItem, comment: string) => {
    try {
      await rejectMutation.mutateAsync({
        content_type: item.content_type,
        content_id: item.id,
        comment,
      });
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  const handleToggleExpand = (item: ReviewQueueItem) => {
    setExpandedItemId(expandedItemId === item.id ? null : item.id);
  };

  const handleViewFull = (item: ReviewQueueItem) => {
    const routeMap: Record<string, string> = {
      blog: "blogs",
      news: "news",
      project: "projects",
      insight: "insights",
      case_study: "case-studies",
    };
    const route = routeMap[item.content_type] || `${item.content_type}s`;
    window.location.href = `/${route}/${item.slug}/edit`;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve content submitted for publication
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isMutating}
            className="interactive-button flex items-center gap-2"
          >
            <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <QueueFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        isLoading={isLoading}
        totalCount={totalItems}
      />

      {/* Sort Bar */}
      <div className="flex items-center justify-between sm:flex-row flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-input rounded-md bg-card text-foreground py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"} found
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !data?.items ? (
          <LoadingState message="Loading review queue..." rows={5} />
        ) : error ? (
          <ErrorState
            message="Failed to load review queue. Please try again."
            onRetry={handleRefresh}
          />
        ) : totalItems === 0 ? (
          <EmptyState
            title="No items in review queue"
            description="All caught up! There are no content items waiting for review at the moment."
          />
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <div key={item.id} className="relative">
                <QueueItemCard
                  item={item}
                  onExpand={handleToggleExpand}
                  isExpanded={expandedItemId === item.id}
                />

                {/* Expanded Detail View */}
                {expandedItemId === item.id && (
                  <ExpandedQueueItemView
                    item={item}
                    onClose={() => handleToggleExpand(item)}
                    onViewFull={() => handleViewFull(item)}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onReject={handleReject}
                    isMutating={isMutating}
                  />
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="flex items-center justify-center p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-foreground px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || isLoading}
                  className="flex items-center justify-center p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
