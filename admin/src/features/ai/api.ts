import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { GenerateContentRequest, GenerateContentResponse } from './types';

export const generateDraft = async (
 data: GenerateContentRequest
): Promise<GenerateContentResponse> => {
 const response = await axiosInstance.post<GenerateContentResponse>(
 API.ai.generate,
 data
 );
 return response.data;
};
