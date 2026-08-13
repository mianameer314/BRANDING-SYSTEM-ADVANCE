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
      <div className="flex items-center justify-end">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Pipeline"
          className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
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
