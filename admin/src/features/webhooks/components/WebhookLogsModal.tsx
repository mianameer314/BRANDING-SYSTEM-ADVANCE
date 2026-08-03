import { X, ChevronDown, ChevronRight, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useWebhookLogs } from '../hooks';

interface WebhookLogsModalProps {
 isOpen: boolean;
 onClose: () => void;
 webhookId: number | null;
}

export const WebhookLogsModal = ({ isOpen, onClose, webhookId }: WebhookLogsModalProps) => {
 const [page, setPage] = useState(1);
 const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

 const { data, isLoading, isError } = useWebhookLogs(webhookId || 0, { page, per_page: 10 });

 if (!isOpen || !webhookId) return null;

 const toggleRow = (id: number) => {
 const next = new Set(expandedRows);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 setExpandedRows(next);
 };

 const formatDate = (isoString: string) => {
 return new Date(isoString).toLocaleString();
 };

 return (
 <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4">
 <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl " style={{ maxHeight: '90vh' }}>
 <div className="flex items-center justify-between border-b p-4 ">
 <h2 className="flex items-center gap-2 text-lg font-bold text-foreground ">
 <Activity className="h-5 w-5 text-info" />
 Webhook Delivery Logs
 </h2>
 <button onClick={onClose} className="rounded p-1 hover:bg-white text-muted-foreground">
 <X className="h-5 w-5" />
 </button>
 </div>

 <div className="flex-1 overflow-auto bg-white p-4 ">
 {isLoading ? (
 <div className="flex h-32 items-center justify-center text-muted-foreground">Loading logs...</div>
 ) : isError ? (
 <div className="flex h-32 items-center justify-center text-destructive">Failed to load logs.</div>
 ) : data?.items.length === 0 ? (
 <div className="flex h-32 items-center justify-center text-muted-foreground">No delivery logs found.</div>
 ) : (
 <div className="space-y-3">
 {data?.items.map((log) => (
 <div key={log.id} className="rounded-lg border bg-white shadow-sm">
 <div
 className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-white"
 onClick={() => toggleRow(log.id)}
 >
 <div className="flex items-center gap-4">
 {expandedRows.has(log.id) ? (
 <ChevronDown className="h-4 w-4 text-muted-foreground" />
 ) : (
 <ChevronRight className="h-4 w-4 text-muted-foreground" />
 )}
 
 {log.success ? (
 <CheckCircle className="h-5 w-5 text-success" />
 ) : (
 <AlertCircle className="h-5 w-5 text-destructive" />
 )}
 
 <div>
 <div className="flex items-center gap-2 font-medium text-foreground ">
 <span className={log.success ? 'text-success ' : 'text-destructive '}>
 {log.response_status || 'ERR'}
 </span>
 <span className="text-muted-foreground">•</span>
 <span className="text-sm">{log.event}</span>
 </div>
 <div className="text-xs text-muted-foreground ">
 {formatDate(log.delivered_at)} — {log.content_type} #{log.content_id}
 </div>
 </div>
 </div>
 </div>

 {expandedRows.has(log.id) && (
 <div className="border-t p-4 space-y-4 bg-white/50 ">
 <div>
 <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request Payload</div>
 <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-foreground ">
 {log.request_body ? JSON.stringify(JSON.parse(log.request_body), null, 2) : 'N/A'}
 </pre>
 </div>
 
 <div>
 <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response Details</div>
 {log.error_message ? (
 <div className="rounded bg-destructive/10 p-2 text-sm text-destructive ">
 {log.error_message}
 </div>
 ) : (
 <pre className="overflow-x-auto rounded bg-white p-2 text-xs text-foreground ">
 {log.response_body || 'No response body'}
 </pre>
 )}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Pagination Footer */}
 {data && data.total > 10 && (
 <div className="flex items-center justify-between border-t p-4 ">
 <button
 disabled={page === 1}
 onClick={() => setPage(p => p - 1)}
 className="rounded px-3 py-1 text-sm bg-white text-foreground disabled:opacity-50 "
 >
 Previous
 </button>
 <span className="text-sm text-muted-foreground">
 Page {page}
 </span>
 <button
 disabled={page * 10 >= data.total}
 onClick={() => setPage(p => p + 1)}
 className="rounded px-3 py-1 text-sm bg-white text-foreground disabled:opacity-50 "
 >
 Next
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
