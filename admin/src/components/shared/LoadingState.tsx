import { Loader2 } from 'lucide-react';

export function LoadingState({ rows = 5, message }: { rows?: number; message?: string }) {
 if (message) {
 return (
 <div className="flex flex-col items-center justify-center gap-3 py-12">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 <p className="text-sm font-medium text-muted-foreground">{message}</p>
 </div>
 );
 }

 return (
 <div className="animate-pulse space-y-0 overflow-hidden rounded-xl border border-border bg-white">
 {/* Header row */}
 <div className="flex gap-4 border-b border-border px-6 py-3">
 {[40, 25, 15, 12, 8].map((w, i) => (
 <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w}%` }} />
 ))}
 </div>
 {/* Data rows */}
 {Array.from({ length: rows }).map((_, i) => (
 <div key={i} className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0">
 <div className="h-4 w-2/5 rounded bg-muted" />
 <div className="h-5 w-20 rounded-full bg-muted" />
 <div className="h-4 w-24 rounded bg-muted" />
 <div className="h-4 w-20 rounded bg-muted" />
 <div className="h-4 w-16 rounded bg-muted" />
 </div>
 ))}
 </div>
 );
}
