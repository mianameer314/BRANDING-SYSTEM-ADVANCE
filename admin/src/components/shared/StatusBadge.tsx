import { cn } from '@/utils/utils';
import type { ContentStatus } from '@/types/api.types';

export const statusVariants: Record<ContentStatus, { dot: string; text: string; bg: string }> = {
 published: {
 dot: 'bg-emerald-500',
 text: 'text-emerald-700',
 bg: 'bg-emerald-100/60 border-emerald-300',
 },
 draft: {
 dot: 'bg-slate-500',
 text: 'text-slate-700',
 bg: 'bg-slate-100 border-slate-300',
 },
 in_review: {
 dot: 'bg-amber-500',
 text: 'text-amber-700',
 bg: 'bg-amber-100 border-amber-300',
 },
 changes_requested: {
 dot: 'bg-rose-500',
 text: 'text-rose-700',
 bg: 'bg-rose-100 border-rose-300',
 },
 approved: {
 dot: 'bg-cyan-500',
 text: 'text-cyan-700',
 bg: 'bg-cyan-100 border-cyan-300',
 },
 scheduled: {
 dot: 'bg-fuchsia-500',
 text: 'text-fuchsia-700',
 bg: 'bg-fuchsia-100 border-fuchsia-300',
 },
 unpublished: {
 dot: 'bg-orange-500',
 text: 'text-orange-700',
 bg: 'bg-orange-100 border-orange-300',
 },
 archived: {
 dot: 'bg-zinc-600',
 text: 'text-zinc-700',
 bg: 'bg-zinc-200 border-zinc-400',
 },
};

interface StatusBadgeProps {
 status: ContentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
 const v = statusVariants[status] ?? statusVariants.draft;
 return (
 <span
 className={cn(
 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
 v.bg,
 v.text
 )}
 >
 <span className={cn('h-1.5 w-1.5 rounded-full', v.dot)} />
 {status}
 </span>
 );
}
