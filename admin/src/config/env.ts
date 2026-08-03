/**
 * Centralized environment configuration.
 *
 * All access to import.meta.env MUST go through this module.
 * Never import import.meta.env directly in feature files.
 *
 * If a required variable is missing the app will throw at startup
 * with a clear message, not silently fail at runtime.
 */

const getRequired = (key: string): string => {
 const value = import.meta.env[key] as string | undefined;
 if (!value) {
 throw new Error(
 `[Config] Missing required environment variable: "${key}". ` +
 'Check your .env file (see .env.example for required keys).'
 );
 }
 return value;
};

export const env = {
 apiBaseUrl: getRequired('VITE_API_BASE_URL'),
 frontendUrl: getRequired('VITE_FRONTEND_URL'),

 tokenStorageKey: getRequired('VITE_TOKEN_STORAGE_KEY'),
 refreshTokenStorageKey: getRequired('VITE_REFRESH_TOKEN_STORAGE_KEY'),
} as const;
