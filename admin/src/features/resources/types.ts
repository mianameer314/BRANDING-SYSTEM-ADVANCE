export type ContentType = 'blog' | 'news' | 'project' | 'insight' | 'case_study';

export interface ResourceOut {
 id: number;
 content_type: ContentType;
 content_id: number;
 file_url: string;
 file_name: string | null;
 created_at: string;
}

export interface ResourceCreatePayload {
 contentType: ContentType;
 contentId: number;
 file: File;
}

export interface ResourceUpdatePayload {
 resourceId: number;
 file: File;
}

export interface DownloadResponse {
 download_url: string;
 file_name: string | null;
}
