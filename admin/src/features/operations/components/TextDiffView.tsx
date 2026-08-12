import { useMemo } from 'react';
import { diffWords, diffLines, Change } from 'diff';

interface TextDiffViewProps {
  oldValue: string;
  newValue: string;
  mode?: 'words' | 'lines';
}

export function TextDiffView({ oldValue, newValue, mode = 'words' }: TextDiffViewProps) {
  const diffResult = useMemo(() => {
    const safeOld = String(oldValue || '');
    const safeNew = String(newValue || '');
    return mode === 'words' ? diffWords(safeOld, safeNew) : diffLines(safeOld, safeNew);
  }, [oldValue, newValue, mode]);

  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed">
      {diffResult.map((part: Change, index: number) => {
        if (part.added) {
          return (
            <span key={index} className="bg-emerald-500/20 text-emerald-700 font-bold px-0.5 rounded">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-rose-500/20 text-rose-700 line-through opacity-70 px-0.5 rounded">
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
}
