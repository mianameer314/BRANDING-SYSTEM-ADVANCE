import { Filter, X } from 'lucide-react';
import { SearchInput } from '@/components/table/SearchInput';

export interface OperationsFilters {
  search?: string;
  status?: string;
  content_type?: string;
  author?: string;
}

interface OperationsFilterBarProps {
  filters: OperationsFilters;
  onChange: (key: keyof OperationsFilters, value: any) => void;
  onReset: () => void;
}

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blogs' },
  { value: 'news', label: 'News' },
  { value: 'project', label: 'Projects' },
  { value: 'insight', label: 'Insights' },
  { value: 'case_study', label: 'Case Studies' },
];

export const OperationsFilterBar = ({
  filters,
  onChange,
  onReset,
}: OperationsFilterBarProps) => {
  const hasActiveFilters = 
    !!filters.search || 
    !!filters.status || 
    !!filters.content_type || 
    !!filters.author;

  return (
    <div className="bg-card p-4 rounded-lg border border-border flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="w-full sm:w-auto flex-1 max-w-md">
          <SearchInput 
            value={filters.search || ''} 
            onChange={(val) => onChange('search', val)} 
            placeholder="Search by title..."
          />
        </div>

        {/* Filters */}
        <div className="w-full sm:w-auto flex flex-wrap gap-3 items-center">
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground ">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          <select
            value={filters.content_type || ''}
            onChange={(e) => onChange('content_type', e.target.value)}
            className="text-sm border border-input rounded-md bg-background text-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Content Types</option>
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by author..."
            value={filters.author || ''}
            onChange={(e) => onChange('author', e.target.value)}
            className="text-sm border border-input rounded-md bg-background text-foreground py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary w-[160px]"
          />

          {hasActiveFilters && (
            <button
              onClick={onReset}
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
