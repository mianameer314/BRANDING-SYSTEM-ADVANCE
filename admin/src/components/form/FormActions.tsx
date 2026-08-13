/**
 * FormActions — Cancel + Submit buttons with loading state.
 *
 * Integrates with react-hook-form's isDirty state.
 * The Unsaved Changes prompt is handled at the page level via useBlocker.
 */
import { Loader2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '@/features/auth/hooks/usePermission';

interface FormActionsProps {
    isLoading: boolean;
    isDirty: boolean;
    isEdit?: boolean;
    cancelTo?: string;
    onDelete?: () => void;
    onLivePreview?: () => void;
    onSecurePreview?: () => void;
}

export function FormActions({
    isLoading,
    isDirty,
    isEdit = false,
    cancelTo,
    onDelete,
    onLivePreview,
    onSecurePreview,
}: FormActionsProps) {
    const navigate = useNavigate();
    const canDelete = usePermission('delete');

    const handleCancel = () => {
        if (cancelTo) {
            navigate(cancelTo);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="flex flex-col gap-4 pt-4 border-t border-border w-full">
            {/* Top Row: Preview Buttons */}
            {(onLivePreview || onSecurePreview) && (
                <div className="flex items-center gap-3 w-full">
                    {onLivePreview && (
                        <button
                            type="button"
                            onClick={onLivePreview}
                            disabled={isLoading}
                            className="flex-1 flex justify-center items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-0.5 hover:shadow-md shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0"
                        >
                            <Eye size={16} />
                            Live Preview
                        </button>
                    )}

                    {onSecurePreview && (
                        <button
                            type="button"
                            onClick={onSecurePreview}
                            disabled={isLoading}
                            className="flex-1 flex justify-center items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-0.5 hover:shadow-md shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0"
                            title="Generate a secure preview token for the saved draft"
                        >
                            <ExternalLink size={16} />
                            Secure Preview
                        </button>
                    )}
                </div>
            )}

            {/* Bottom Row: Delete, Cancel, Update */}
            <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center">
                    {onDelete && canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0"
                            title="Delete permanently"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-zinc-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !isDirty}
                        className={[
                            'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-secondary transition-all duration-200 active:scale-95 disabled:active:scale-100 disabled:hover:translate-y-0',
                            isLoading || !isDirty
                                ? 'bg-primary opacity-60 cursor-not-allowed'
                                : 'bg-primary hover:bg-secondary hover:text-white hover:-translate-y-0.5 hover:shadow-md',
                        ].join(' ')}
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
