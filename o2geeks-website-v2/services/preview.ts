import axiosServices from '@/utils/axios';
import { AxiosError } from 'axios';
import type { PreviewErrorState } from '@/types/preview';

let previewAbortController: AbortController | null = null;

export const PreviewService = {
  async resolvePreview<T>(contentType: string, token: string): Promise<{ data?: T; error?: PreviewErrorState }> {
    // Cancel any ongoing preview request to ensure we only get the latest one
    if (previewAbortController) {
      previewAbortController.abort();
    }
    previewAbortController = new AbortController();

    try {
      const response = await axiosServices.get<{ data: T }>(`/preview/${contentType}`, {
        params: { token },
        signal: previewAbortController.signal
      });
      return { data: response.data as unknown as T };
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.code === 'ERR_CANCELED') {
          // This was cancelled intentionally, don't return an error state
          return {};
        }

        if (!e.response) {
          // Network Error / Backend Offline
          return { error: 'offline' };
        }

        const status = e.response.status;
        const msg = e.response.data?.detail || '';

        if (status === 401 || status === 403) return { error: 'unauthorized' };
        if (status === 404) return { error: 'deleted' };
        
        // 400 Bad Request can cover Invalid or Expired tokens depending on API detail
        if (status === 400) {
          if (msg.toLowerCase().includes('expire')) return { error: 'expired' };
          return { error: 'invalid' };
        }

        return { error: 'network' }; // Fallback generic network error
      }
      return { error: 'network' };
    }
  }
};
