import { cn } from '@/utils/utils';
import { MinusCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { TextDiffView } from './TextDiffView';
import { RichTextDiffView } from './RichTextDiffView';

interface DiffFieldRowProps {
  label: string;
  oldValue: any;
  newValue: any;
  type?: 'text' | 'rich-text' | 'image' | 'json';
}

export function DiffFieldRow({ label, oldValue, newValue, type = 'text' }: DiffFieldRowProps) {
  const isUnchanged = JSON.stringify(oldValue) === JSON.stringify(newValue);
  const isAdded = !oldValue && newValue;
  const isRemoved = oldValue && !newValue;
  
  if (isUnchanged) {
    return (
      <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-border/50 items-start opacity-60 hover:opacity-100 transition-opacity">
        <div className="md:col-span-3 text-sm font-semibold text-muted-foreground pt-1">
          {label}
        </div>
        <div className="md:col-span-9 bg-muted/20 p-3 rounded-lg text-sm text-muted-foreground truncate">
          Unchanged
        </div>
      </div>
    );
  }

  const renderValue = (val: any) => {
    if (!val) return <span className="text-muted-foreground italic">Empty</span>;
    if (type === 'image') {
      return <img src={val} alt={label} className="h-20 w-auto rounded-md shadow-sm border border-border" />;
    }
    if (type === 'json' || typeof val === 'object') {
      return <pre className="text-xs bg-muted/50 p-2 rounded">{JSON.stringify(val, null, 2)}</pre>;
    }
    return <span className="break-words">{String(val)}</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-border/50 items-start">
      <div className="md:col-span-3">
        <h4 className="text-sm font-bold text-foreground capitalize tracking-wide">{label.replace(/_/g, ' ')}</h4>
        <div className="flex gap-2 mt-2">
          {isAdded && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Added</span>}
          {isRemoved && <span className="text-[10px] bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><MinusCircle className="w-3 h-3"/> Removed</span>}
          {!isAdded && !isRemoved && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Modified</span>}
        </div>
      </div>

      <div className="md:col-span-9">
        {type === 'text' && !isAdded && !isRemoved ? (
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <TextDiffView oldValue={oldValue} newValue={newValue} />
          </div>
        ) : type === 'rich-text' && !isAdded && !isRemoved ? (
          <RichTextDiffView oldHtml={oldValue} newHtml={newValue} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Value */}
            <div className={cn(
              "p-4 rounded-lg border",
              isRemoved ? "bg-rose-500/5 border-rose-500/30" : "bg-muted/10 border-border/50"
            )}>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex justify-between items-center">
                Old Value
                {isRemoved && <span className="text-rose-500 font-bold">-</span>}
              </div>
              <div className={cn("text-sm", isRemoved && "text-rose-700/80")}>
                {renderValue(oldValue)}
              </div>
            </div>

            {/* New Value */}
            <div className={cn(
              "p-4 rounded-lg border shadow-sm",
              isAdded ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-card border-border"
            )}>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex justify-between items-center">
                New Value
                {isAdded && <span className="text-emerald-500 font-bold">+</span>}
              </div>
              <div className={cn("text-sm font-medium", isAdded && "text-emerald-700")}>
                {renderValue(newValue)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
