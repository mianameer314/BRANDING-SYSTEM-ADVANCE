import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { RevisionListResponse } from './types';

export const listRevisions = (contentType: string, contentId: number) =>
 axiosInstance.get<RevisionListResponse>(API.audit.revisions(contentType, contentId)).then((response) => response.data);

export const restoreRevision = (contentType: string, contentId: number, version: number, reason: string) =>
 axiosInstance.post(API.audit.restore(contentType, contentId, version), { reason }).then((response) => response.data);
