export interface ContentRevision {
 id: number;
 content_type: string;
 content_id: number;
 version: number;
 action: string;
 snapshot: Record<string, unknown>;
 changed_fields: string[] | null;
 actor_id: number | null;
 source: string;
 approval_reference: string | null;
 status_reason: string | null;
 restored_from_revision_id: number | null;
 created_at: string;
}

export interface RevisionListResponse {
 items: ContentRevision[];
 total: number;
 page: number;
 per_page: number;
}
