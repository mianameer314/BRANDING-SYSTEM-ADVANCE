import { axiosInstance } from '@/api/axios';

export interface GeneratePreviewTokenRequest {
 content_type: string;
 content_id: number;
}

export const generatePreviewToken = async (data: GeneratePreviewTokenRequest): Promise<string> => {
 const response = await axiosInstance.post<{ token: string }>('/preview/generate', data);
 return response.data.token;
};
