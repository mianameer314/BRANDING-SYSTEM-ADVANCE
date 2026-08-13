
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
      <OperationsFilterBar 
        filters={filters}
        onChange={onFilterChange}
        onReset={onFilterReset}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
