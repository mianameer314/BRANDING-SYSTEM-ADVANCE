import type { ContentStatus } from '@/types/api.types';

export interface WorkflowStageStats {
  total: number;
  by_type: Record<string, number>;
}

export interface WorkflowOverviewData {
  stages: Record<ContentStatus | string, WorkflowStageStats>;
  total_content: number;
}

export interface ReviewQueueItem {
  id: number;
  content_type: string;
  slug: string;
  title: string;
  status: ContentStatus;
  author: string;
  created_at: string;
  updated_at: string;
  status_changed_at: string | null;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  per_page: number;
}
