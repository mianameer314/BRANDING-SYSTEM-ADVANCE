import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
 isOpen: boolean;
 title: string;
 message: string;
 confirmText?: string;
 cancelText?: string;
 isLoading?: boolean;
 onConfirm: () => void;
 onCancel: () => void;
}

export function ConfirmModal({
 isOpen,
 title,
 message,
 confirmText = 'Confirm',
 cancelText = 'Cancel',
 isLoading = false,
 onConfirm,
 onCancel,
}: ConfirmModalProps) {
 if (!isOpen) return null;

 return createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
 <div 
 className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
 onClick={!isLoading ? onCancel : undefined} 
 />
 
 <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl bg-white border border-border shadow-2xl sm:my-8 animate-in fade-in zoom-in-95 duration-200">
 
 <div className="px-6 py-5 sm:flex sm:items-start gap-4">
 <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:mx-0">
 <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
 </div>
 
 <div className="mt-3 text-center sm:ml-2 sm:mt-0 sm:text-left">
 <h3 className="text-lg font-semibold leading-6 text-foreground">
 {title}
 </h3>
 <div className="mt-2">
 <p className="text-sm text-muted-foreground">
 {message}
 </p>
 </div>
 </div>
 </div>
 
 <div className="bg-white/50 px-6 py-4 border-t border-border sm:flex sm:flex-row-reverse sm:gap-2">
 <button
 type="button"
 className="inline-flex w-full justify-center items-center rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-destructive disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-colors"
 onClick={onConfirm}
 disabled={isLoading}
 >
 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {confirmText}
 </button>
 
 <button
 type="button"
 className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto border border-border transition-colors"
 onClick={onCancel}
 disabled={isLoading}
 >
 {cancelText}
 </button>
 </div>
 
 </div>
 </div>,
 document.body
 );
}
