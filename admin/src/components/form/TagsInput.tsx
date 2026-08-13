/**
 * TagsInput — comma-separated tag entry.
 * Renders as a plain text input; serialization to JSON array
 * happens in buildFormData() before submission.
 *
 * Backend: tags: str | None = Form(None, description='JSON array string')
 */
import type { InputHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

interface TagsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: FieldError;
}

export function TagsInput({ label = 'Tags', error, ...inputProps }: TagsInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <input
                type="text"
                placeholder='e.g. react, typescript, web development'
                {...inputProps}
                className={[
                    'rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none',
                    'placeholder:text-muted-foreground transition-colors',
                    'focus:border-primary focus:ring-1 focus:ring-primary',
                    error ? 'border-destructive/30' : 'border-border',
                ]
                    .filter(Boolean)
                    .join(' ')}
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            {error && <p className="text-xs text-destructive">{error.message}</p>}
        </div>
    );
}
