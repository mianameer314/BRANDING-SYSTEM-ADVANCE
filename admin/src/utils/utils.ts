import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

/** Format an ISO datetime string to a readable date. */
export function formatDate(iso: string | null): string {
 if (!iso) return '—';
 return new Intl.DateTimeFormat('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 }).format(new Date(iso));
}

/** Truncate a string to a maximum length. */
export function truncate(str: string, maxLen: number): string {
 return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

/** Capitalize the first letter of a string. */
export function capitalize(str: string): string {
 return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Resolve backend image paths to absolute URLs using the API origin. */
export function resolveImageUrl(path: string | null | undefined): string | null {
 if (!path) return null;
 // If it's already an absolute URL (http, https, blob, data), return it
 if (/^(https?:\/\/|blob:|data:)/.test(path)) return path;
 
 // Extract the base origin from the API base URL.
 // For example: 'http://localhost:8000/api/v1' -> 'http://localhost:8000'
 try {
 // import.meta.env is used directly here to avoid circular dependency if env.ts relies on utils later
 const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
 const url = new URL(baseUrl);
 return `${url.origin}${path.startsWith('/') ? path : `/${path}`}`;
 } catch {
 return path;
 }
}
