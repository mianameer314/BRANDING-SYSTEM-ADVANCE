import { X, GitCompare } from 'lucide-react';
import { DiffFieldRow } from './DiffFieldRow';

interface RevisionDiffViewerProps {
  baseRevision: any;
  compareRevision: any;
  onClose: () => void;
}

export function RevisionDiffViewer({ baseRevision, compareRevision, onClose }: RevisionDiffViewerProps) {
  const baseData = baseRevision.snapshot || {};
  const compareData = compareRevision.snapshot || {};

  // All keys from both objects to compare
  const allKeys = Array.from(new Set([...Object.keys(baseData), ...Object.keys(compareData)]));
  
  // Exclude system fields from visual diff
  const excludeFields = ['id', 'created_at', 'updated_at', 'status_changed_at', 'status_changed_by_id', 'owner_id'];
  const fieldsToCompare = allKeys.filter(k => !excludeFields.includes(k)).sort();

  const getFieldType = (key: string) => {
    if (key === 'body' || key === 'content' || key === 'excerpt') return 'rich-text';
    if (key.includes('image') || key === 'client_logo') return 'image';
    if (key === 'gallery' || key === 'tags' || key === 'metrics' || key === 'tech_stack' || key.startsWith('_')) return 'json';
    return 'text';
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg flex flex-col h-full min-h-[600px] animate-in fade-in zoom-in-95 duration-300">
      <div className="p-4 sm:p-6 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-md text-sm font-bold text-muted-foreground">
              v{baseRevision.version}
            </span>
            <GitCompare className="w-5 h-5 text-amber-500" />
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-md text-sm font-bold shadow-sm">
              v{compareRevision.version}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <h3 className="font-bold text-foreground hidden sm:block">Side-by-Side Comparison</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-background border border-border rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-2 sm:p-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b-2 border-border mb-4 sticky top-0 bg-card z-10 p-2 pt-0">
          <div className="md:col-span-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Field</div>
          <div className="md:col-span-9 grid grid-cols-2 gap-4">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Version {baseRevision.version}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-600">Version {compareRevision.version}</div>
          </div>
        </div>

        <div className="space-y-2">
          {fieldsToCompare.map(key => (
            <DiffFieldRow 
              key={key}
              label={key}
              oldValue={baseData[key]}
              newValue={compareData[key]}
              type={getFieldType(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
