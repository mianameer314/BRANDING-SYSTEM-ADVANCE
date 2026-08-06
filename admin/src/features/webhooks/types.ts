export interface Webhook {
 id: number;
 url: string;
 event: string;
 content_types: string[];
 description: string | null;
 is_active: boolean;
 created_at: string;
 secret?: string;
 secret_masked?: string;
}

export interface WebhookCreate {
 url: string;
 event: string;
 content_types: string[];
 description?: string;
}

export interface WebhookUpdate {
 url?: string;
 is_active?: boolean;
 content_types?: string[];
 description?: string;
}

export interface WebhookLog {
 id: number;
 webhook_id: number;
 event: string;
 content_type: string;
 content_id: number;
 request_url: string;
 response_status: number | null;
 success: boolean;
 error_message: string | null;
 request_body: string | null;
 response_body: string | null;
 delivered_at: string;
}
