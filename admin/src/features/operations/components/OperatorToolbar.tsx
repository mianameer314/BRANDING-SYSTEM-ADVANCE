import { RefreshCw } from 'lucide-react';
import { OperationsFilterBar, type OperationsFilters } from './OperationsFilterBar';

interface OperatorToolbarProps {
  filters: OperationsFilters;
  onFilterChange: (key: keyof OperationsFilters, value: any) => void;
  onFilterReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function OperatorToolbar({
  filters,
  onFilterChange,
  onFilterReset,
  onRefresh,
  isRefreshing,
}: OperatorToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Content Pipeline</h2>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh Pipeline</span>
        </button>
      </div>
      
      <OperationsFilterBar 
        filters={filters}
        onChange={onFilterChange}
        onReset={onFilterReset}
      />
    </div>
  );
}
