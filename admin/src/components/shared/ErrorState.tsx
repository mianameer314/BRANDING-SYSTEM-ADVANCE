import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
 message?: string;
 onRetry?: () => void;
}

export function ErrorState({
 message = 'Failed to load data.',
 onRetry,
}: ErrorStateProps) {
 return (
 <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 py-16 text-center">
 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
 <AlertCircle size={24} />
 </div>
 <p className="mb-1 text-sm font-semibold text-foreground">
 Something went wrong
 </p>
 <p className="mb-6 max-w-xs text-sm text-muted-foreground">{message}</p>
 {onRetry && (
 <button
 onClick={onRetry}
 className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
 >
 <RefreshCw size={14} />
 Retry
 </button>
 )}
 </div>
 );
}
