import { axiosInstance as api } from '@/api/axios';
import type { WorkflowOverviewData, ReviewQueueResponse } from './types';

export const operationsApi = {
  getWorkflowOverview: async (): Promise<WorkflowOverviewData> => {
    const response = await api.get('/operations/workflow-overview');
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
      params.append('content_type', contentType);
    }
    if (status) {
      params.append('status', status);
    }
    if (search) {
      params.append('search', search);
    }
    if (author) {
      params.append('author', author);
    }
    
    const response = await api.get(`/operations/items?${params.toString()}`);
    return response.data;
  },
};
