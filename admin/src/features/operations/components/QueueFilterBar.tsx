import { Filter, X } from "lucide-react";
import { SearchInput } from "@/components/table/SearchInput";
import { CustomSelect } from "@/components/shared/CustomSelect";
import type { ReviewQueueFilters } from "../types";

interface QueueFilterBarProps {
  filters: ReviewQueueFilters;
  onChange: (key: keyof ReviewQueueFilters, value: any) => void;
  onReset: () => void;
  isLoading?: boolean;
  totalCount: number;
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
}: QueueFilterBarProps) => {
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
        </div>
      </div>
    </div>
  );
};
