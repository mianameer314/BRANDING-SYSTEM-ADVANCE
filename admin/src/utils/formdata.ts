/**
 * buildFormData — converts typed form state into a FormData instance
 * for multipart/form-data submission to the backend.
 *
 * Rules (matching backend router expectations):
 * - Arrays (tags, technologies) → JSON-serialized string, e.g. '["a","b"]'
 * - MetricItem[] (metrics) → JSON-serialized string
 * - File fields → appended directly as File objects
 * - Empty strings → sent as the string "null" (backend uses parse_optional_string)
 * - null / undefined fields → omitted entirely
 * - boolean fields → sent as "true" / "false" strings (FormData requirement)
 */

import type { MetricItem } from '@/features/shared/forms/schemas';

export interface FormDataFields {
 [key: string]: string | number | boolean | string[] | MetricItem[] | File | File[] | null | undefined;
}

export function buildFormData(fields: FormDataFields): FormData {
 const fd = new FormData();

 for (const [key, value] of Object.entries(fields)) {
 if (value === undefined || value === null) {
 // Omit null/undefined — backend handles missing fields as "no change"
 continue;
 }

 if (value instanceof File) {
 fd.append(key, value);
 continue;
 }

 if (Array.isArray(value)) {
 // File[] (gallery uploads)
 if (value.length > 0 && value[0] instanceof File) {
 (value as File[]).forEach((file) => fd.append(key, file));
 continue;
 }
 // string[] (tags, technologies) or MetricItem[] (metrics) → JSON string
 fd.append(key, JSON.stringify(value));
 continue;
 }

 if (typeof value === 'boolean') {
 fd.append(key, value ? 'true' : 'false');
 continue;
 }

 if (typeof value === 'string' && value === '') {
 // Empty string signals a field clear; backend parse_optional_string handles this
 fd.append(key, '');
 continue;
 }

 fd.append(key, String(value));
 }

 return fd;
}

/**
 * Converts a comma-separated tags string to a JSON array string.
 * Used to prepare tags/technologies for the backend's json.loads() parser.
 *
 * '' → undefined (omit from payload)
 * 'react, typescript' → '["react","typescript"]'
 */
export function tagsStringToJson(value: string | undefined): string | undefined {
 if (value === undefined) return undefined;
 if (value.trim() === '') return '[]';
 const items = value
 .split(',')
 .map((t) => t.trim())
 .filter(Boolean);
 if (items.length === 0) return '[]';
 return JSON.stringify(items);
}
