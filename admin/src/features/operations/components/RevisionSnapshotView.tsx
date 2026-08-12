import { format } from 'date-fns';
import { FileJson, History, ArrowRight } from 'lucide-react';
import { operationsApi } from '@/features/operations/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface RevisionSnapshotViewProps {
  revision: any;
  latestVersion: number;
  onRestoreSuccess: () => void;
}

export function RevisionSnapshotView({ revision, latestVersion, onRestoreSuccess }: RevisionSnapshotViewProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  const isLatest = revision.version === latestVersion;

  const handleRestore = async () => {
    if (!window.confirm(`Are you sure you want to restore version ${revision.version}? This will create a new revision based on this snapshot.`)) return;
    
    setIsRestoring(true);
    try {
      await operationsApi.restoreRevision(revision.content_type, revision.content_id, revision.version, 'Restored from operations console');
      toast.success(`Successfully restored version ${revision.version}`);
      onRestoreSuccess();
    } catch (err) {
      toast.error('Failed to restore revision');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Version {revision.version}
            {isLatest && (
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                Current Latest
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <History className="w-4 h-4 opacity-70" />
            {format(new Date(revision.created_at), 'MMM d, yyyy - h:mm:ss a')}
            <span className="opacity-50">•</span>
            Actor #{revision.actor_id || 'System'}
          </p>
        </div>
        
        {!isLatest && (
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore this version'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-background/50">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <FileJson className="w-4 h-4" />
          Raw Snapshot Data
        </div>
        
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-inner">
          <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(revision.snapshot, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
