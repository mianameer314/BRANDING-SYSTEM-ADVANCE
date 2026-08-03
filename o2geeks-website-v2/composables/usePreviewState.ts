import { useState } from '#app';
import type { PreviewMode, PreviewErrorState } from '@/types/preview';

export const usePreviewState = () => {
  const previewContent = useState<any | null>('preview-content', () => null);
  const previewType = useState<string | null>('preview-type', () => null);
  const previewMode = useState<PreviewMode>('preview-mode', () => 'none');
  const previewConnected = useState<boolean>('preview-connected', () => false);
  const previewError = useState<PreviewErrorState>('preview-error', () => null);

  return {
    previewContent,
    previewType,
    previewMode,
    previewConnected,
    previewError
  };
};
