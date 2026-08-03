import type { TextareaHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
 label: string;
 error?: FieldError;
 hint?: string;
}

export function FormTextarea({ label, error, hint, id, ...textareaProps }: FormTextareaProps) {
 const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

 return (
 <div className="flex flex-col gap-1.5">
 <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
 {label}
 {textareaProps.required && <span className="ml-1 text-destructive">*</span>}
 </label>

 <textarea
 id={fieldId}
 rows={6}
 {...textareaProps}
 className={[
 'rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none',
 'placeholder:text-muted-foreground transition-colors resize-y',
 'focus:border-primary focus:ring-1 focus:ring-primary',
 error ? 'border-destructive/30' : 'border-border',
 textareaProps.disabled ? 'cursor-not-allowed opacity-50' : '',
 ]
 .filter(Boolean)
 .join(' ')}
 />

 {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
 {error && <p className="text-xs text-destructive">{error.message}</p>}
 </div>
 );
}
