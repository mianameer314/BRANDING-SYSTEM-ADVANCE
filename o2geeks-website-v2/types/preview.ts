export type PreviewMode = 'live' | 'token' | 'none';
export type PreviewErrorState = 'expired' | 'invalid' | 'unauthorized' | 'deleted' | 'offline' | 'network' | null;

export interface PreviewPayload<T = any> {
  version: number;
  type: string;
  mode: PreviewMode;
  previewSessionId: string;
  updatedAt: number;
  data: Partial<T>;
}
