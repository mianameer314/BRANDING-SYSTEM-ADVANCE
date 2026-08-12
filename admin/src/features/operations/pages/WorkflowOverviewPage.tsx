import { WorkflowColumn } from '../components/WorkflowColumn';

export function WorkflowOverviewPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Pipeline Overview</h2>
        <p className="text-muted-foreground mt-1">
          Visual kanban board of content flowing through the editorial lifecycle.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full min-w-max gap-6 items-stretch">
          <WorkflowColumn 
            title="Drafts" 
            status="draft" 
            colorClass="bg-slate-500" 
          />
          <WorkflowColumn 
            title="In Review" 
            status="in_review" 
            colorClass="bg-amber-500" 
          />
          <WorkflowColumn 
            title="Changes Requested" 
            status="changes_requested" 
            colorClass="bg-rose-500" 
          />
          <WorkflowColumn 
            title="Approved" 
            status="approved" 
            colorClass="bg-cyan-500" 
          />
          <WorkflowColumn 
            title="Scheduled" 
            status="scheduled" 
            colorClass="bg-fuchsia-500" 
          />
          <WorkflowColumn 
            title="Published" 
            status="published" 
            colorClass="bg-emerald-500" 
          />
          <WorkflowColumn 
            title="Unpublished" 
            status="unpublished" 
            colorClass="bg-orange-500" 
          />
          <WorkflowColumn 
            title="Archived" 
            status="archived" 
            colorClass="bg-zinc-600" 
          />
        </div>
      </div>
    </div>
  );
}
