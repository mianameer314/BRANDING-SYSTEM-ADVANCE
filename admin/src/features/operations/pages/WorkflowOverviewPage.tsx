import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkflowColumn } from '../components/WorkflowColumn';

export function WorkflowOverviewPage() {
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Content Pipeline</h2>
        <p className="text-muted-foreground mt-1">
          Visual kanban board of content flowing through the editorial lifecycle.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4" ref={scrollRef}>
        <div className="flex h-full min-w-max gap-6 items-stretch p-1">
          <div data-status="draft">
          <WorkflowColumn 
            title="Drafts" 
            status="draft" 
            colorClass="bg-slate-500" 
          />
          </div>
          <div data-status="in_review">
          <WorkflowColumn 
            title="In Review" 
            status="in_review" 
            colorClass="bg-amber-500" 
          />
          </div>
          <div data-status="changes_requested">
          <WorkflowColumn 
            title="Changes Requested" 
            status="changes_requested" 
            colorClass="bg-rose-500" 
          />
          </div>
          <div data-status="approved">
          <WorkflowColumn 
            title="Approved" 
            status="approved" 
            colorClass="bg-cyan-500" 
          />
          </div>
          <div data-status="scheduled">
          <WorkflowColumn 
            title="Scheduled" 
            status="scheduled" 
            colorClass="bg-fuchsia-500" 
          />
          </div>
          <div data-status="published">
          <WorkflowColumn 
            title="Published" 
            status="published" 
            colorClass="bg-emerald-500" 
          />
          </div>
          <div data-status="unpublished">
          <WorkflowColumn 
            title="Unpublished" 
            status="unpublished" 
            colorClass="bg-orange-500" 
          />
          </div>
          <div data-status="archived">
          <WorkflowColumn 
            title="Archived" 
            status="archived" 
            colorClass="bg-zinc-600" 
          />
          </div>
        </div>
      </div>
    </div>
  );
}
