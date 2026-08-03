/**
 * TechInput — same as TagsInput but labeled for technologies.
 * Reuses TagsInput with different label and placeholder.
 *
 * Backend: technologies: str | None = Form(None, description="JSON array string")
 */
import { TagsInput } from './TagsInput';
import type { InputHTMLAttributes } from 'react';
import type { FieldError } from 'react-hook-form';

interface TechInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
 error?: FieldError;
}

export function TechInput({ error, ...inputProps }: TechInputProps) {
 return (
 <TagsInput
 label="Technologies"
 placeholder="e.g. React, FastAPI, PostgreSQL"
 error={error}
 {...inputProps}
 />
 );
}
