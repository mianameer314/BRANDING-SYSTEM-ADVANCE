import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosProgressEvent } from 'axios';
import { 
 listContentResources, 
 createResource, 
 updateResource, 
 deleteResource, 
 downloadResource 
} from './api';
import type { 
 ContentType, 
 ResourceCreatePayload, 
 ResourceUpdatePayload 
} from './types';

export const useContentResources = (contentType: ContentType, contentId: number) =>
 useQuery({
 queryKey: ['resources', contentType, contentId],
 queryFn: () => listContentResources(contentType, contentId),
 enabled: !!contentId,
 });

export const useCreateResource = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({
 payload,
 onUploadProgress,
 }: {
 payload: ResourceCreatePayload;
 onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
 }) => createResource(payload, onUploadProgress),
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({
 queryKey: ['resources', variables.payload.contentType, variables.payload.contentId],
 });
 },
 });
};

export const useUpdateResource = (contentType: ContentType, contentId: number) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({
 payload,
 onUploadProgress,
 }: {
 payload: ResourceUpdatePayload;
 onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
 }) => updateResource(payload, onUploadProgress),
 onSuccess: () => {
 queryClient.invalidateQueries({
 queryKey: ['resources', contentType, contentId],
 });
 },
 });
};

export const useDeleteResource = (contentType: ContentType, contentId: number) => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => deleteResource(id),
 onSuccess: () => {
 queryClient.invalidateQueries({
 queryKey: ['resources', contentType, contentId],
 });
 },
 });
};

export const useDownloadResource = () => {
 return useMutation({
 mutationFn: (id: number) => downloadResource(id),
 });
};
