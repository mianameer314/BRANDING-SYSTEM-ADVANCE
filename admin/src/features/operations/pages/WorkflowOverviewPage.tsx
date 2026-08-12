import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkflowColumn } from '../components/WorkflowColumn';
import { OperatorToolbar } from '../components/OperatorToolbar';
import { useQueryClient } from '@tanstack/react-query';
import type { OperationsFilters } from '../components/OperationsFilterBar';

export function WorkflowOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const filters: OperationsFilters = {
    search: searchParams.get('search') || '',
    content_type: searchParams.get('content_type') || '',
    author: searchParams.get('author') || '',
    // Note: status is used for auto-scrolling to a column, not filtering the whole board
  };

  const handleFilterChange = (key: keyof OperationsFilters, value: any) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      return newParams;
    });
  };

  const handleFilterReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
  };

  useEffect(() => {
    const status = searchParams.get('status');
    if (status && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-status="${status}"]`);
      if (el) {
        // Small delay to ensure render is complete before scrolling
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }, 100);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <OperatorToolbar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onFilterReset={handleFilterReset}
        onRefresh={handleRefresh}
      />

      <div className="flex-1 overflow-x-auto pb-4" ref={scrollRef}>
        <div className="flex h-full min-w-max gap-6 items-stretch p-1">
          <div data-status="draft">
          <WorkflowColumn 
            title="Drafts" 
            status="draft" 
            colorClass="bg-slate-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="in_review">
          <WorkflowColumn 
            title="In Review" 
            status="in_review" 
            colorClass="bg-amber-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="changes_requested">
          <WorkflowColumn 
            title="Changes Requested" 
            status="changes_requested" 
            colorClass="bg-rose-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="approved">
          <WorkflowColumn 
            title="Approved" 
            status="approved" 
            colorClass="bg-cyan-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="scheduled">
          <WorkflowColumn 
            title="Scheduled" 
            status="scheduled" 
            colorClass="bg-fuchsia-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="published">
          <WorkflowColumn 
            title="Published" 
            status="published" 
            colorClass="bg-emerald-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="unpublished">
          <WorkflowColumn 
            title="Unpublished" 
            status="unpublished" 
            colorClass="bg-orange-500" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
          <div data-status="archived">
          <WorkflowColumn 
            title="Archived" 
            status="archived" 
            colorClass="bg-zinc-600" 
            search={filters.search} author={filters.author} contentType={filters.content_type}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
