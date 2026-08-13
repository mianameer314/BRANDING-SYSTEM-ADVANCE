import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { env } from '@/config/env';
import { API } from './endpoints';

export const axiosInstance = axios.create({
 baseURL: env.apiBaseUrl,
 headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
 failedQueue.forEach((prom) => {
 if (error) {
 prom.reject(error);
 } else if (token) {
 prom.resolve(token);
 }
 });
 failedQueue = [];
};

// ── Request interceptor: inject auth token + handle FormData ─────────────────
axiosInstance.interceptors.request.use((config) => {
 const token = localStorage.getItem(env.tokenStorageKey);
 if (token && config.headers) {
 // If it's a refresh request, it must use the refresh token
 if (config.url === API.auth.refresh) {
 const refreshToken = localStorage.getItem(env.refreshTokenStorageKey);
 if (refreshToken) {
 config.headers.Authorization = `Bearer ${refreshToken}`;
 }
 } else {
 config.headers.Authorization = `Bearer ${token}`;
 }
 }

 // For multipart/form-data requests, delete the default JSON Content-Type
 // so the browser can auto-generate the correct boundary string.
 // JSON requests (auth, etc.) are unaffected.
 if (config.data instanceof FormData && config.headers) {
 delete config.headers['Content-Type'];
 }

 // Inject Idempotency-Key for all mutating requests (Day 4)
 if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
   if (config.headers && !config.headers['Idempotency-Key']) {
     config.headers['Idempotency-Key'] = crypto.randomUUID();
   }
 }

 return config;
});

// ── Response interceptor: handle 401 and refresh queue ──────────────────────
axiosInstance.interceptors.response.use(
 (response) => response,
 async (error: unknown) => {
 const originalRequest = (error as AxiosError).config as AxiosRequestConfig & { _retry?: boolean };
 
 if (axios.isAxiosError(error)) {
 if (error.response?.status === 403) {
  // We intentionally do not show a global toast for 403 errors here.
  // Background queries should fail silently (and render an error state in the UI if needed),
  // while explicit user actions (mutations) will catch the error and show a toast themselves.
  return Promise.reject(error);
 }

 if (error.response?.status === 401 && originalRequest) {
 // 1. Skip if the request was to login, register, or refresh (prevent loop)
 const isAuthEndpoint = 
 originalRequest.url === API.auth.login || 
 originalRequest.url === API.auth.register || 
 originalRequest.url === API.auth.refresh;
 
 if (isAuthEndpoint) {
 return Promise.reject(error);
 }

 // 2. Check if a refresh token exists
 const refreshToken = localStorage.getItem(env.refreshTokenStorageKey);
 if (!refreshToken) {
 // No refresh token -> hard logout
 localStorage.removeItem(env.tokenStorageKey);
 window.location.href = '/login';
 return Promise.reject(error);
 }

 if (originalRequest._retry) {
 // We already tried to retry this exact request, fail
 return Promise.reject(error);
 }

 if (isRefreshing) {
 // 3. Queue the request if a refresh is already in progress
 return new Promise(function (resolve, reject) {
 failedQueue.push({ resolve, reject });
 })
 .then((token) => {
 if (originalRequest.headers) {
 originalRequest.headers.Authorization = 'Bearer ' + token;
 }
 return axiosInstance(originalRequest);
 })
 .catch((err) => {
 return Promise.reject(err);
 });
 }

 originalRequest._retry = true;
 isRefreshing = true;

 try {
 // 4. Attempt to refresh
 const { data } = await axiosInstance.post<{ access_token: string; refresh_token: string }>(
 API.auth.refresh
 );
 
 // 5. Success -> Store new tokens
 localStorage.setItem(env.tokenStorageKey, data.access_token);
 localStorage.setItem(env.refreshTokenStorageKey, data.refresh_token);
 
 if (originalRequest.headers) {
 originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
 }

 // Replay queued requests
 processQueue(null, data.access_token);

 return axiosInstance(originalRequest);
 } catch (refreshError) {
 // 6. Refresh failed -> clear everything
 processQueue(refreshError, null);
 localStorage.removeItem(env.tokenStorageKey);
 localStorage.removeItem(env.refreshTokenStorageKey);
 // Dispatch custom event so AuthProvider can clear context & React Query cache
 window.dispatchEvent(new Event('auth:logout'));
 window.location.href = '/login';
 return Promise.reject(refreshError);
 } finally {
 isRefreshing = false;
 }
 }
 }

 return Promise.reject(error);
 }
);
