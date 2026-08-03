import { type AxiosProgressEvent } from 'axios';
import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { 
 ResourceOut, 
 ResourceCreatePayload, 
 ResourceUpdatePayload,
 DownloadResponse 
} from './types';

export const listContentResources = (contentType: string, contentId: number): Promise<ResourceOut[]> =>
 axiosInstance.get<ResourceOut[]>(API.resources.listContent(contentType, contentId)).then((r) => r.data);

export const createResource = (
 { contentType, contentId, file }: ResourceCreatePayload,
 onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ResourceOut> => {
 const fd = new FormData();
 fd.append('content_type', contentType);
 fd.append('content_id', String(contentId));
 fd.append('file', file);

 return axiosInstance
 .post<ResourceOut>(API.resources.create, fd, { onUploadProgress })
 .then((r) => r.data);
};

export const updateResource = (
 { resourceId, file }: ResourceUpdatePayload,
 onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ResourceOut> => {
 const fd = new FormData();
 fd.append('file', file);

 return axiosInstance
 .put<ResourceOut>(API.resources.update(resourceId), fd, { onUploadProgress })
 .then((r) => r.data);
};

export const deleteResource = (id: number): Promise<void> =>
 axiosInstance.delete(API.resources.delete(id)).then(() => undefined);

export const downloadResource = (id: number): Promise<DownloadResponse> =>
 axiosInstance.get<DownloadResponse>(API.resources.download(id)).then((r) => r.data);
