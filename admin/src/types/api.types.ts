// ── Auth ────────────────────────────────────────────────────────────────────
import type { Permission } from './permissions';

export interface RegisterRequest {
 full_name: string;
 email: string;
 password: string;
}

export interface LoginRequest {
 email: string;
 password: string;
}

export interface UpdateProfileRequest {
 full_name: string | null;
}

export interface ChangePasswordRequest {
 current_password: string;
 new_password: string;
}

export interface VerifyEmailRequest {
 email: string;
 otp_code: string;
}

export interface ResendOtpRequest {
 email: string;
 purpose: string;
}

export interface ForgotPasswordRequest {
 email: string;
}

export interface ResetPasswordRequest {
 email: string;
 otp_code: string;
 new_password: string;
}

export interface TokenResponse {
 access_token: string;
 refresh_token: string;
 token_type: string;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user';

export interface UserOut {
 id: number;
 email: string;
 full_name: string;
 role: UserRole;
 is_active: boolean;
 created_at: string;
 updated_at: string;
 permissions: Permission[];
}

// ── Common ──────────────────────────────────────────────────────────────────

export type ContentStatus =
 | 'draft'
 | 'in_review'
 | 'changes_requested'
 | 'approved'
 | 'scheduled'
 | 'published'
 | 'unpublished'
 | 'archived';

export interface LifecycleAuditFields {
 status_changed_at: string | null;
 status_changed_by_id: number | null;
 status_change_reason: string | null;
}

import type { ContentFilters } from './filters';

export interface PaginatedResponse<T> {
 items: T[];
 total: number;
 page: number;
 per_page: number;
}

export type ListParams = ContentFilters;
// ── Blog ────────────────────────────────────────────────────────────────────

export interface BlogOut extends LifecycleAuditFields {
 id: number;
 title: string;
 slug: string;
 author: string;
 content: string;
 excerpt: string | null;
 cover_image: string | null;
 category: string | null;
 tags: string[] | null;
 ai_generated: boolean;
 status: ContentStatus;
 published_at: string | null;
 created_at: string;
 updated_at: string;
 likes_count: number;
 comments_count: number;
 is_liked: boolean;
}

export interface BlogListParams extends ListParams {
 category?: string;
}

// ── News ────────────────────────────────────────────────────────────────────
// NOTE: News uses `headline` (not `title`) and `summary` (not `content`).

export interface NewsOut extends LifecycleAuditFields {
 id: number;
 headline: string; // primary display field — NOT 'title'
 slug: string;
 summary: string;
 cover_image: string | null;
 source: string | null;
 ai_generated: boolean;
 is_featured: boolean;
 status: ContentStatus;
 published_at: string | null;
 created_at: string;
 updated_at: string;
 likes_count: number;
 comments_count: number;
 is_liked: boolean;
}

export interface NewsListParams extends ListParams {
 is_featured?: boolean;
}

// ── Project ─────────────────────────────────────────────────────────────────
// NOTE: Projects use `name` (not `title`) as the primary display field.

export interface ProjectOut extends LifecycleAuditFields {
 id: number;
 name: string; // primary display field — NOT 'title'
 slug: string;
 client: string | null;
 description: string;
 short_desc: string | null;
 cover_image: string | null;
 gallery: string[] | null;
 technologies: string[] | null;
 category: string | null;
 project_url: string | null;
 ai_generated: boolean;
 is_featured: boolean;
 status: ContentStatus;
 completed_at: string | null;
 published_at: string | null;
 created_at: string;
 updated_at: string;
 likes_count: number;
 comments_count: number;
 is_liked: boolean;
}

export interface ProjectListParams extends ListParams {
 category?: string;
 is_featured?: boolean;
}

// ── Insight ─────────────────────────────────────────────────────────────────

export interface InsightOut extends LifecycleAuditFields {
 id: number;
 title: string;
 slug: string;
 author: string;
 content: string;
 excerpt: string | null;
 cover_image: string | null;
 category: string | null;
 tags: string[] | null;
 ai_generated: boolean;
 status: ContentStatus;
 published_at: string | null;
 created_at: string;
 updated_at: string;
 likes_count: number;
 comments_count: number;
 is_liked: boolean;
}

export interface InsightListParams extends ListParams {
 category?: string;
}

// ── Case Study ──────────────────────────────────────────────────────────────

export interface MetricItem {
 label: string;
 value: string;
}

export interface CaseStudyOut extends LifecycleAuditFields {
 id: number;
 title: string;
 slug: string;
 client_name: string;
 client_logo: string | null;
 industry: string | null;
 challenge: string;
 solution: string;
 results: string;
 metrics: MetricItem[] | null;
 testimonial: string | null;
 testimonial_author: string | null;
 cover_image: string | null;
 gallery: string[] | null;
 technologies: string[] | null;
 ai_generated: boolean;
 is_featured: boolean;
 status: ContentStatus;
 published_at: string | null;
 created_at: string;
 updated_at: string;
 likes_count: number;
 comments_count: number;
 is_liked: boolean;
}

export interface CaseStudyListParams extends ListParams {
 industry?: string;
 is_featured?: boolean;
}
