import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operationsApi } from "./api";
import type { ReviewQueueFilters, ApprovalActionPayload, ChangeRequestPayload, RejectionPayload } from "./types";

export function useWorkflowOverview() {
  return useQuery({
    queryKey: ["operations", "workflow-overview"],
    queryFn: () => operationsApi.getWorkflowOverview(),
  });
}

export function useWorkflowItems(page: number = 1, perPage: number = 20, contentType?: string, status?: string, search?: string, author?: string) {
  return useQuery({
    queryKey: ["operations", "items", page, perPage, contentType, status, search, author],
    queryFn: () => operationsApi.getWorkflowItems(page, perPage, contentType, status, search, author),
  });
}

export function useReviewQueue(filters: ReviewQueueFilters = {}) {
  return useQuery({
    queryKey: ["operations", "review-queue", filters],
    queryFn: () => operationsApi.getReviewQueue(filters),
  });
}

export function useApproveContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApprovalActionPayload) => operationsApi.approveContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "workflow-overview"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "items"] });
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeRequestPayload) => operationsApi.requestChanges(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "workflow-overview"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "items"] });
    },
  });
}

export function useRejectContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RejectionPayload) => operationsApi.rejectContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "workflow-overview"] });
      queryClient.invalidateQueries({ queryKey: ["operations", "items"] });
    },
  });
}
