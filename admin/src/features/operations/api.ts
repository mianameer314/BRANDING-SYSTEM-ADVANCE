import { axiosInstance as api } from "@/api/axios";
import type { 
  WorkflowOverviewData, 
  ReviewQueueResponse, 
  ApprovalActionPayload,
  ChangeRequestPayload,
  RejectionPayload,
  ReviewQueueFilters,
} from "./types";

export const operationsApi = {
  getWorkflowOverview: async (): Promise<WorkflowOverviewData> => {
    const response = await api.get("/operations/workflow-overview");
    return response.data;
  },

  getWorkflowItems: async (
    page: number = 1,
    perPage: number = 20,
    contentType?: string,
    status?: string,
    search?: string,
    author?: string
  ): Promise<ReviewQueueResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (contentType) {
      params.append("content_type", contentType);
    }
    if (status) {
      params.append("status", status);
    }
    if (search) {
      params.append("search", search);
    }
    if (author) {
      params.append("author", author);
    }
    
    const response = await api.get(`/operations/items?${params.toString()}`);
    return response.data;
  },

  // --- Review Queue (Approval Queue) ---
  getReviewQueue: async (filters: ReviewQueueFilters = {}): Promise<ReviewQueueResponse> => {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      per_page: (filters.per_page || 20).toString(),
    });
    
    if (filters.content_type) {
      params.append("content_type", filters.content_type);
    }
    if (filters.author) {
      params.append("author", filters.author);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.ai_generated !== undefined) {
      params.append("ai_generated", filters.ai_generated.toString());
    }
    
    const response = await api.get(`/operations/review-queue?${params.toString()}`);
    return response.data;
  },

  // --- Approval Actions ---
  approveContent: async (data: ApprovalActionPayload) => {
    const response = await api.post("/operations/approve", data);
    return response.data;
  },

  requestChanges: async (data: ChangeRequestPayload) => {
    const response = await api.post("/operations/request-changes", data);
    return response.data;
  },

  rejectContent: async (data: RejectionPayload) => {
    const response = await api.post("/operations/reject", data);
    return response.data;
  },

  // --- Revisions & History ---
  getRevisions: async (contentType: string, contentId: number, params?: Record<string, any>) => {
    const response = await api.get(`/audit/content/${contentType}/${contentId}/revisions`, { params });
    return response.data;
  },
    
  restoreRevision: async (contentType: string, contentId: number, version: number, reason: string | null = null) => {
    const response = await api.post(`/audit/content/${contentType}/${contentId}/revisions/${version}/restore`, { reason });
    return response.data;
  },
    
  // --- Preview ---
  getPreviewToken: async (contentType: string, contentId: number) => {
    const response = await api.post<{ token: string }>("/preview/generate", {
      content_type: contentType,
      content_id: contentId
    });
    return response.data;
  },
    
  getPreviewData: async (contentType: string, token: string) => {
    const response = await api.get(`/preview/${contentType}`, { params: { token } });
    return response.data;
  },

  // --- New Methods ---
  scheduleContent: async (data: any) => {
    const response = await api.post("/operations/schedule", data);
    return response.data;
  },
  publishNow: async (data: any) => {
    const response = await api.post("/operations/publish-now", data);
    return response.data;
  },
  rescheduleContent: async (data: any) => {
    const response = await api.post("/operations/reschedule", data);
    return response.data;
  },
  cancelSchedule: async (data: any) => {
    const response = await api.post("/operations/cancel-schedule", data);
    return response.data;
  },
  getScheduleQueue: async (params: any) => {
    const q = new URLSearchParams(params).toString();
    const response = await api.get(`/operations/schedule-queue?${q}`);
    return response.data;
  },
  getPublishLogs: async (params: any) => {
    const q = new URLSearchParams(params).toString();
    const response = await api.get(`/operations/publish-logs?${q}`);
    return response.data;
  },
  retryPublish: async (logId: number) => {
    const response = await api.post("/operations/retry-publish", { log_id: logId });
    return response.data;
  },
  resolveFailure: async (logId: number, comment: string) => {
    const response = await api.post("/operations/resolve-failure", { log_id: logId, comment });
    return response.data;
  },
};
