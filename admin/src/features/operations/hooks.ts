import { useQuery } from '@tanstack/react-query';
import { operationsApi } from './api';

export function useWorkflowOverview() {
  return useQuery({
    queryKey: ['operations', 'workflow-overview'],
    queryFn: () => operationsApi.getWorkflowOverview(),
  });
}

export function useWorkflowItems(page: number = 1, perPage: number = 20, contentType?: string, status?: string) {
  return useQuery({
    queryKey: ['operations', 'items', page, perPage, contentType, status],
    queryFn: () => operationsApi.getWorkflowItems(page, perPage, contentType, status),
  });
}
