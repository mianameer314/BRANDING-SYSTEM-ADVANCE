import { useBlocker } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, Save, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationGuardProps {
  isDirty: boolean;
  onSave: () => Promise<boolean>;
}

export function NavigationGuard({ isDirty, onSave }: NavigationGuardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Set returnValue to trigger the native browser confirmation dialog
      e.returnValue = ''; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  if (blocker.state !== "blocked") return null;

  const handleSaveAndLeave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave();
      if (success) {
        blocker.proceed();
      } else {
        setIsSaving(false);
        blocker.reset();
      }
    } catch (e) {
      console.error("Save failed:", e);
      setIsSaving(false);
      blocker.reset();
    }
  };

  const handleLeave = () => {
    blocker.proceed();
  };

  const handleCancel = () => {
    blocker.reset();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      />
      
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-white border border-border shadow-2xl sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 sm:flex sm:items-start gap-4">
          <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 sm:mx-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          
          <div className="mt-3 text-center sm:ml-2 sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold leading-6 text-foreground">
              Unsaved Changes
            </h3>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                You have pending changes. Do you want to save them before leaving?
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-50 px-6 py-4 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            className="inline-flex w-full justify-center items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-zinc-100 border border-border transition-all duration-200 active:scale-95 sm:w-auto whitespace-nowrap"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2 opacity-70" />
            Keep Editing
          </button>
          
          <button
            type="button"
            className="inline-flex w-full justify-center items-center rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive shadow-sm hover:bg-destructive/20 hover:shadow-md transition-all duration-200 active:scale-95 sm:w-auto whitespace-nowrap"
            onClick={handleLeave}
            disabled={isSaving}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave without saving
          </button>
          
          <button
            type="button"
            className="inline-flex w-full justify-center items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-all duration-200 active:scale-95 whitespace-nowrap"
            onClick={handleSaveAndLeave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save & Update
          </button>
        </div>
        
      </div>
    </div>,
    document.body
  );
}
