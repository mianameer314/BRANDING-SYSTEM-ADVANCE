import type { ContentStatus } from '@/types/api.types';

export interface WorkflowStageStats {
  total: number;
  by_type: Record<string, number>;
}

export interface WorkflowOverviewData {
  stages: Record<ContentStatus | string, WorkflowStageStats>;
  total_content: number;
  failed_webhooks: number;
  recent_activity: ReviewQueueItem[];
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
  status_changed_at?: string;
  published_at?: string;
  cover_image: string | null;
  ai_generated: boolean;
  requested_publish_date?: string;
  media_status?: { media_count: number; gallery_count: number };
  content_preview?: string;
  owner_info?: { name: string; email: string; role: string };
  validation_warnings: string[];
  project_url?: string;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  per_page: number;
}

// ─── Approval Queue Types ───

export interface ApprovalActionPayload {
  content_type: string;
  content_id: number;
  comment?: string;
  reason?: string;
}

export interface ChangeRequestPayload {
  content_type: string;
  content_id: number;
  comment: string;
  reason?: string;
}

export interface RejectionPayload {
  content_type: string;
  content_id: number;
  comment: string;
  reason?: string;
}

export interface ReviewQueueFilters {
  page?: number;
  per_page?: number;
  content_type?: string;
  author?: string;
  search?: string;
  ai_generated?: boolean;
  requested_publish_date?: string;
  media_status?: { media_count: number; gallery_count: number };
  content_preview?: string;
  owner_info?: { name: string; email: string; role: string };
}

export interface QueueItemDetailData extends ReviewQueueItem {
  excerpt?: string;
  content_preview?: string;
  validation_warnings: string[];
  media_status?: { media_count: number; gallery_count: number };
  ai_generated: boolean;
  requested_publish_date?: string;
  revision_history?: Array<{
    version: number;
    action: string;
    actor_name: string;
    created_at: string;
    changed_fields: string[];
  }>;
  owner_info?: {
    name: string;
    email: string;
    role: string;
  };
  timeline?: Array<{
    event: string;
    timestamp: string;
    actor: string;
    details?: string;
  }>;
}
