import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './api';
import type { UsersListParams, UserCreate, UserUpdate } from './types';

export const userKeys = {
 all: ['users'] as const,
 list: (params: UsersListParams) => [...userKeys.all, 'list', params] as const,
 detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

export function useUsers(params: UsersListParams) {
 return useQuery({
 queryKey: userKeys.list(params),
 queryFn: () => usersApi.list(params),
 placeholderData: (previousData) => previousData,
 });
}

export function useUser(id: number) {
 return useQuery({
 queryKey: userKeys.detail(id),
 queryFn: () => usersApi.get(id),
 enabled: !!id,
 });
}

export function useCreateUser() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (data: UserCreate) => usersApi.create(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: userKeys.all });
 },
 });
}

export function useUpdateUser() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
 usersApi.update(id, data),
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: userKeys.all });
 queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
 },
 });
}

export function useDeactivateUser() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (id: number) => usersApi.deactivate(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: userKeys.all });
 },
 });
}
