import { useMemo } from 'react';
import { diffLines, Change } from 'diff';

interface RichTextDiffViewProps {
  oldHtml: string;
  newHtml: string;
}

export function RichTextDiffView({ oldHtml, newHtml }: RichTextDiffViewProps) {
  const diffResult = useMemo(() => {
    return diffLines(oldHtml || '', newHtml || '');
  }, [oldHtml, newHtml]);

  // A true visual rich text diff is complex. 
  // We'll use a split view showing old vs new, but we can also show a unified HTML block
  // by wrapping added/removed blocks in styled divs.
  
  return (
    <div className="bg-background rounded-lg p-4 border border-border/50 max-h-[400px] overflow-y-auto prose prose-sm max-w-none">
      {diffResult.map((part: Change, index: number) => {
        if (part.added) {
          return (
            <div 
              key={index} 
              className="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-2 my-2 rounded-r"
              dangerouslySetInnerHTML={{ __html: part.value }}
            />
          );
        }
        if (part.removed) {
          return (
            <div 
              key={index} 
              className="bg-rose-500/10 border-l-4 border-rose-500 pl-4 py-2 my-2 rounded-r opacity-60 line-through"
              dangerouslySetInnerHTML={{ __html: part.value }}
            />
          );
        }
        return (
          <div 
            key={index} 
            className="my-2"
            dangerouslySetInnerHTML={{ __html: part.value }}
          />
        );
      })}
    </div>
  );
}
