import { Filter, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/components/table/SearchInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { cn } from "@/utils/utils";
import type { ReviewQueueFilters } from "../types";

interface QueueFilterBarProps {
  filters: ReviewQueueFilters;
  onChange: (key: keyof ReviewQueueFilters, value: any) => void;
  onReset: () => void;
  isLoading?: boolean;
  totalCount: number;
  onRefresh?: () => void;
}

const CONTENT_TYPES = [
  { value: "blog", label: "Blogs", colorClass: "bg-primary" },
  { value: "news", label: "News", colorClass: "bg-info" },
  { value: "project", label: "Projects", colorClass: "bg-success" },
  { value: "insight", label: "Insights", colorClass: "bg-warning" },
  { value: "case_study", label: "Case Studies", colorClass: "bg-destructive" },
];

export const QueueFilterBar = ({
  filters,
  onChange,
  onReset,
  isLoading = false,
  totalCount = 0,
  onRefresh,
}: QueueFilterBarProps) => {
  const [showRefreshed, setShowRefreshed] = useState(false);

  const handleRefreshClick = () => {
    if (onRefresh) onRefresh();
    setShowRefreshed(true);
    setTimeout(() => setShowRefreshed(false), 2000);
  };
  const hasActiveFilters =
    !!filters.content_type ||
    !!filters.author ||
    !!filters.ai_generated;

  return (
    <div className="bg-card p-4 rounded-lg border border-border flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Count */}
        <div className="text-sm font-semibold text-foreground">
          {totalCount} {totalCount === 1 ? "item" : "items"} pending review
        </div>

        {/* Search */}
        <div className="w-full sm:w-auto flex-1 max-w-md">
          <SearchInput
            value={filters.search || ""}
            onChange={(val) => onChange("search", val)}
            placeholder="Search by title..."
          />
        </div>

        {/* Filters */}
        <div className="w-full sm:w-auto flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          <CustomSelect
            options={CONTENT_TYPES}
            value={filters.content_type || ""}
            onChange={(value) => onChange("content_type", value)}
            placeholder="All Content Types"
            className="w-[180px]"
          />

          <input
            type="text"
            placeholder="Filter by author..."
            value={filters.author || ""}
            onChange={(e) => onChange("author", e.target.value)}
            className="text-sm border border-input rounded-md bg-card text-foreground py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary w-[160px] shadow-sm hover:bg-accent/50 transition-colors"
          />

          <label className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.ai_generated}
              onChange={(e) => onChange("ai_generated", e.target.checked)}
              className="h-4 w-4 rounded border-input border-primary/20 text-primary focus:ring-primary"
            />
            <span className="hidden sm:inline">AI Generated</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2"
              title="Clear all filters"
            >
              <X size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {onRefresh && (
            <>
              <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
              <div className="relative">
                <button
                  onClick={handleRefreshClick}
                  disabled={isLoading}
                  title="Refresh Queue"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-accent hover:bg-muted text-foreground transition-colors disabled:opacity-50 relative z-10"
                >
                  <RefreshCw size={14} className={isLoading || showRefreshed ? "animate-spin" : ""} />
                </button>
                <div 
                  className={cn(
                    "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded pointer-events-none transition-all duration-300 ease-out",
                    showRefreshed ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"
                  )}
                >
                  Refreshed!
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
