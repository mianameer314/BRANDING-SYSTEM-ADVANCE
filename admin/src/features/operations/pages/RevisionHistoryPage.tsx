import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { operationsApi } from '@/features/operations/api';
import { RevisionTimeline } from '@/features/operations/components/RevisionTimeline';
import { RevisionSnapshotView } from '@/features/operations/components/RevisionSnapshotView';
import { RevisionDiffViewer } from '@/features/operations/components/RevisionDiffViewer';
import { LayoutDashboard, Copy } from 'lucide-react';

export function RevisionHistoryPage() {
  const { contentType, contentId } = useParams<{ contentType: string; contentId: string }>();
  const navigate = useNavigate();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['revisions', contentType, contentId],
    queryFn: () => operationsApi.getRevisions(contentType!, parseInt(contentId!)),
    enabled: !!contentType && !!contentId,
  });

  const { setHeaderState } = useOutletContext<any>();

  useEffect(() => {
    setHeaderState({
      title: 'Revision History',
      subtitle: 'Track changes and compare versions.',
      showBackButton: true
    });
  }, [setHeaderState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-destructive/20 text-destructive mt-8 max-w-2xl mx-auto shadow-sm">
        <h3 className="text-xl font-bold mb-2">Error Loading Revisions</h3>
        <p>Failed to load revision history for this content.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const revisions = data.items || [];
  
  // Set initial selected version to latest if not set
  if (selectedVersion === null && revisions.length > 0) {
    setSelectedVersion(revisions[0].version);
  }

  const selectedRevisionObj = revisions.find((r: any) => r.version === selectedVersion);
  const compareRevisionObj = isComparing ? revisions.find((r: any) => r.version === compareVersion) : null;

  const handleToggleCompare = (version: number) => {
    if (!isComparing) {
      setCompareVersion(version);
      setIsComparing(true);
    } else if (compareVersion === version) {
      setIsComparing(false);
      setCompareVersion(null);
    } else {
      setCompareVersion(version);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/operations/preview/${contentType}/${contentId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-primary/20 hover:border-primary/50 text-foreground rounded-lg shadow-sm hover:shadow-md transition-all font-medium group"
          >
            <LayoutDashboard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Website Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Timeline */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden sticky top-6">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <h3 className="font-bold text-foreground">Timeline</h3>
              <p className="text-xs text-muted-foreground mt-1">{revisions.length} versions found</p>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              <RevisionTimeline 
                revisions={revisions} 
                selectedVersion={selectedVersion}
                compareVersion={compareVersion}
                onSelect={(v) => {
                  setSelectedVersion(v);
                  if (isComparing && v === compareVersion) setIsComparing(false);
                }}
                onToggleCompare={handleToggleCompare}
              />
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9">
          {isComparing && compareRevisionObj && selectedRevisionObj ? (
            <RevisionDiffViewer 
              baseRevision={compareRevisionObj.version < selectedRevisionObj.version ? compareRevisionObj : selectedRevisionObj}
              compareRevision={compareRevisionObj.version > selectedRevisionObj.version ? compareRevisionObj : selectedRevisionObj}
              onClose={() => setIsComparing(false)}
            />
          ) : selectedRevisionObj ? (
            <RevisionSnapshotView 
              revision={selectedRevisionObj}
              latestVersion={revisions[0]?.version}
              onRestoreSuccess={() => {
                window.location.reload();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border border-dashed h-full min-h-[400px]">
              <Copy className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-foreground">Select a revision</h3>
              <p className="text-muted-foreground">Choose a version from the timeline to view its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
