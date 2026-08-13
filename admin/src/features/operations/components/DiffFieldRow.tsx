import { cn, resolveImageUrl } from '@/utils/utils';
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
      <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-border/50 items-start opacity-50 hover:opacity-100 transition-opacity duration-200">
        <div className="md:col-span-3 text-sm font-semibold text-muted-foreground pt-1 capitalize">
          {label.replace(/_/g, ' ')}
        </div>
        <div className="md:col-span-9 bg-muted/20 p-3 rounded-lg text-sm text-muted-foreground">
          Unchanged
        </div>
      </div>
    );
  }

  const renderValue = (val: any) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return <span className="text-muted-foreground italic">Empty</span>;
    if (type === 'image') {
      return (
        <a href={resolveImageUrl(val) || val} target="_blank" rel="noopener noreferrer">
          <img src={resolveImageUrl(val) || val} alt={label} className="h-20 w-auto rounded-md shadow-sm border border-border hover:opacity-80 transition-opacity" />
        </a>
      );
    }
    
    if (type === 'json' || typeof val === 'object') {
      if (Array.isArray(val)) {
        if (typeof val[0] === 'string') {
          // If gallery or image URLs
          if (label === 'gallery' || val[0].match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || val[0].includes('http')) {
             return (
               <div className="flex flex-wrap gap-2">
                 {val.map((url, i) => {
                    const resolved = resolveImageUrl(url) || url;
                    return (
                      <a key={i} href={resolved} target="_blank" rel="noopener noreferrer">
                        <img src={resolved} alt={`item-${i}`} className="h-16 w-auto rounded-md shadow-sm border border-border hover:opacity-80 transition-opacity" />
                      </a>
                    );
                 })}
               </div>
             );
          }
          // Tags
          return (
            <div className="flex flex-wrap gap-1.5">
              {val.map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-muted border border-border/50 rounded-md text-[11px] font-medium text-foreground">{item}</span>
              ))}
            </div>
          );
        }

        // Array of objects (Resources, Metrics, etc.)
        return (
          <div className="flex flex-col gap-2">
            {val.map((item, i) => {
              if (item.file_url && item.file_name) {
                 const resolvedUrl = resolveImageUrl(item.file_url) || item.file_url;
                 return (
                   <a key={i} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border border-border bg-background hover:bg-accent hover:border-primary/50 transition-all group">
                     <span className="text-xs font-semibold text-foreground group-hover:text-primary truncate">{item.file_name}</span>
                   </a>
                 );
              }
              // Generic object renderer (e.g. Metrics, Testimonials)
              return (
                <div key={i} className="p-2 border border-border/50 rounded-md bg-muted/10 text-xs flex flex-col gap-1.5">
                  {Object.entries(item).filter(([k]) => k !== 'id' && !k.endsWith('_at')).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-semibold text-muted-foreground capitalize shrink-0">{k.replace(/_/g, ' ')}:</span> 
                      <span className="text-foreground break-words min-w-0">{String(v)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <pre className="text-xs bg-muted/30 border border-border/50 p-3 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all font-mono text-muted-foreground">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="break-words whitespace-pre-wrap leading-relaxed">{String(val)}</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-5 border-b border-border/50 items-start">
      <div className="md:col-span-3">
        <h4 className="text-sm font-bold text-foreground capitalize tracking-wide">{label.replace(/_/g, ' ')}</h4>
        <div className="flex gap-2 mt-2">
          {isAdded && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Added</span>}
          {isRemoved && <span className="text-[10px] bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><MinusCircle className="w-3 h-3"/> Removed</span>}
          {!isAdded && !isRemoved && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Modified</span>}
        </div>
      </div>

      <div className="md:col-span-9 min-w-0">
        {type === 'text' && !isAdded && !isRemoved ? (
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm overflow-hidden">
            <TextDiffView oldValue={oldValue} newValue={newValue} />
          </div>
        ) : type === 'rich-text' && !isAdded && !isRemoved ? (
          <RichTextDiffView oldHtml={oldValue} newHtml={newValue} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Old Value */}
            <div className={cn(
              "p-4 rounded-lg border min-w-0 overflow-hidden",
              isRemoved ? "bg-rose-500/5 border-rose-500/30" : "bg-muted/10 border-border/50"
            )}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex justify-between items-center">
                Old Value
                {isRemoved && <span className="text-rose-500 font-bold text-sm">✕</span>}
              </div>
              <div className={cn("text-sm break-words overflow-hidden", isRemoved && "text-rose-700/80")}>
                {renderValue(oldValue)}
              </div>
            </div>

            {/* New Value */}
            <div className={cn(
              "p-4 rounded-lg border min-w-0 overflow-hidden shadow-sm",
              isAdded ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-card border-border"
            )}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex justify-between items-center">
                New Value
                {isAdded && <span className="text-emerald-500 font-bold text-sm">✓</span>}
              </div>
              <div className={cn("text-sm font-medium break-words overflow-hidden", isAdded && "text-emerald-700")}>
                {renderValue(newValue)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
