import { format } from 'date-fns';
import { User, Calendar, FileText, RotateCcw, Shield, Tag, ChevronRight } from 'lucide-react';
import { operationsApi } from '@/features/operations/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

interface RevisionSnapshotViewProps {
  revision: any;
  latestVersion: number;
  onRestoreSuccess: () => void;
}

export function RevisionSnapshotView({ revision, latestVersion, onRestoreSuccess }: RevisionSnapshotViewProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const isLatest = revision.version === latestVersion;
  const actorName = revision.actor_name || (revision.actor_id ? `User ${revision.actor_id}` : 'System');
  const snapshot = revision.snapshot || {};

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await operationsApi.restoreRevision(revision.content_type, revision.content_id, revision.version, 'Restored from operations console');
      toast.success(`Successfully restored version ${revision.version}`);
      setShowRestoreModal(false);
      onRestoreSuccess();
    } catch (_err) {
      toast.error('Failed to restore revision');
    } finally {
      setIsRestoring(false);
    }
  };

  // Extract human-readable fields from the snapshot
  const importantFields = ['title', 'name', 'slug', 'status', 'category', 'author', 'excerpt', 'short_desc'];
  const metaFields = ['seo_title', 'seo_description', 'seo_keywords', 'published_at', 'created_at', 'updated_at'];

  const displayFields = importantFields.filter(f => snapshot[f] !== undefined && snapshot[f] !== null);
  const displayMetaFields = metaFields.filter(f => snapshot[f] !== undefined && snapshot[f] !== null);

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Version {revision.version}
                </h3>
                {isLatest && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 animate-pulse">
                    Current Latest
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(revision.created_at), 'MMM d, yyyy · h:mm a')}
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium text-foreground/80">{actorName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  {revision.source}
                </span>
              </div>
            </div>

            {!isLatest && (
              <button
                onClick={() => setShowRestoreModal(true)}
                className="interactive-button-small"
              >
                <span className="label">Restore this version</span>
                <RotateCcw className="icon w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {/* Changed Fields Highlight */}
          {revision.changed_fields && revision.changed_fields.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
              <p className="text-xs font-bold uppercase text-amber-600 tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Fields Changed in this Version
              </p>
              <div className="flex flex-wrap gap-2">
                {revision.changed_fields.map((field: string) => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-amber-500/10 text-amber-700 rounded-lg text-xs font-bold border border-amber-500/15 hover:bg-amber-500/20 transition-colors cursor-default"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Summary Cards */}
          {displayFields.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Content Snapshot
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayFields.map(field => (
                  <div
                    key={field}
                    className="bg-muted/20 rounded-xl p-4 border border-border/30 hover:border-primary/20 hover:bg-muted/30 transition-all duration-200 group"
                  >
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest mb-1 group-hover:text-primary/60 transition-colors">
                      {field.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {String(snapshot[field])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Fields */}
          {displayMetaFields.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wider mb-3">
                SEO & Meta
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayMetaFields.map(field => (
                  <div
                    key={field}
                    className="bg-muted/10 rounded-xl p-4 border border-border/20 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200 group"
                  >
                    <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest mb-1 group-hover:text-primary/60 transition-colors">
                      {field.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {String(snapshot[field])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Toggle */}
          <div>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground/60 tracking-wider hover:text-foreground transition-colors group"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showRawJson ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
              Raw Snapshot JSON
            </button>

            {showRawJson && (
              <div className="mt-3 bg-[#0d1117] rounded-xl p-5 border border-border/30 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                <pre className="text-xs text-emerald-400/90 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {JSON.stringify(revision.snapshot, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={showRestoreModal}
        title={`Restore Version ${revision.version}?`}
        message={`The current content will be replaced with version ${revision.version}'s snapshot. A new revision will be recorded in history so nothing is lost.`}
        confirmText="Restore"
        cancelText="Cancel"
        isLoading={isRestoring}
        onConfirm={handleRestore}
        onCancel={() => setShowRestoreModal(false)}
      />
    </>
  );
}
