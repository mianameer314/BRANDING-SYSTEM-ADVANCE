import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import type { FieldError } from 'react-hook-form';
import type { ContentStatus } from '@/types/api.types';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { statusVariants } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface StatusSelectProps {
 value: ContentStatus;
 onChange: (value: ContentStatus) => void;
 currentStatus?: ContentStatus;
 userRole?: string;
 error?: FieldError;
 disabled?: boolean;
}

const statuses: Array<{ value: ContentStatus; label: string }> = [
 { value: 'draft', label: 'Draft' },
 { value: 'in_review', label: 'In review' },
 { value: 'changes_requested', label: 'Changes requested' },
 { value: 'approved', label: 'Approved' },
 { value: 'scheduled', label: 'Scheduled' },
 { value: 'published', label: 'Published' },
 { value: 'unpublished', label: 'Unpublished' },
 { value: 'archived', label: 'Archived' },
];

const allowedTransitions: Record<ContentStatus, ContentStatus[]> = {
 draft: ['in_review', 'published', 'archived'],
 in_review: ['draft', 'changes_requested', 'approved'],
 changes_requested: ['draft', 'in_review', 'archived'],
 approved: ['changes_requested', 'scheduled', 'published', 'archived'],
 scheduled: ['approved', 'published', 'archived'],
 published: ['unpublished', 'archived'],
 unpublished: ['draft', 'archived'],
 archived: ['draft'],
};

const initialStatuses: ContentStatus[] = ['draft', 'in_review', 'published'];
const publishStatuses: ContentStatus[] = ['scheduled', 'published', 'unpublished', 'archived'];

export function StatusSelect({ value, onChange, currentStatus, error, disabled }: StatusSelectProps) {
 const canPublish = usePermission('publish');
 const canApprove = usePermission('approve');

 const isAllowed = (target: ContentStatus) => {
   const validTransition = currentStatus
     ? target === currentStatus || allowedTransitions[currentStatus].includes(target)
     : initialStatuses.includes(target);
   const hasPermission = target === 'approved'
     ? canApprove
     : publishStatuses.includes(target)
       ? canPublish
       : true;
   return validTransition && hasPermission;
 };

 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
       setIsOpen(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const selectedOption = statuses.find(s => s.value === value) || statuses[0];
 const selectedVariant = statusVariants[selectedOption.value] ?? statusVariants.draft;

 return (
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-medium text-foreground">Status</label>

 <div className="relative" ref={dropdownRef}>
   <button
     type="button"
     onClick={() => !disabled && setIsOpen(!isOpen)}
     disabled={disabled}
     title={!canPublish ? "You do not have permission to publish content." : undefined}
     className={cn(
       "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm outline-none transition-all duration-200",
       "focus:border-primary focus:ring-1 focus:ring-primary",
       selectedVariant.bg,
       selectedVariant.text,
       error ? 'border-destructive/30' : 'border-border',
       disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-95'
     )}
   >
     <div className="flex items-center gap-2">
       <span className={cn("h-2 w-2 rounded-full", selectedVariant.dot)} />
       <span className="font-semibold">{selectedOption.label}</span>
     </div>
     <ChevronDown size={16} className="opacity-50" />
   </button>

   {isOpen && (
     <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white p-1 shadow-xl animate-in fade-in-0 zoom-in-95">
       {statuses.map((option) => {
         const isAllowedOption = isAllowed(option.value);
         const variant = statusVariants[option.value] ?? statusVariants.draft;
         return (
           <button
             key={option.value}
             type="button"
             disabled={!isAllowedOption}
             onClick={() => {
               onChange(option.value);
               setIsOpen(false);
             }}
             className={cn(
               "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
               isAllowedOption 
                 ? "cursor-pointer hover:bg-muted" 
                 : "cursor-not-allowed opacity-30 bg-gray-50/50",
               value === option.value ? "bg-muted font-medium" : ""
             )}
           >
             <span className={cn("h-2 w-2 rounded-full", variant.dot)} />
             <span className={cn(
               "flex-1 text-left font-medium", 
               variant.text,
               !isAllowedOption && "line-through decoration-muted-foreground/50"
             )}>
               {option.label} {!isAllowedOption && <span className="text-[10px] uppercase tracking-wide opacity-70 ml-1 text-muted-foreground">(Locked)</span>}
             </span>
             {!isAllowedOption && <Lock size={12} className="text-muted-foreground" />}
             {value === option.value && <Check size={14} className={variant.text} />}
           </button>
         );
       })}
     </div>
   )}
 </div>

 {(!canPublish || !canApprove) && (
 <p className="text-xs text-warning">
 Some lifecycle transitions require approval or publishing permission.
 </p>
 )}
 {error && <p className="text-xs text-destructive">{error.message}</p>}
 </div>
 );
}
