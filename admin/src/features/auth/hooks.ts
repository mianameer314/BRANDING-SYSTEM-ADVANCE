import { useMutation, useQuery } from '@tanstack/react-query';
import { login, register, getMe, updateProfile, changePassword } from './api';
import type { LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types/api.types';

export function useLogin() {
 return useMutation({
 mutationFn: (credentials: LoginRequest) => login(credentials),
 });
}

export function useRegister() {
 return useMutation({
 mutationFn: (payload: RegisterRequest) => register(payload),
 });
}

export function useUpdateProfile() {
 return useMutation({
 mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
 });
}

export function useChangePassword() {
 return useMutation({
 mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
 });
}

export function useCurrentUser(enabled: boolean = true) {
 return useQuery({
 queryKey: ['auth', 'me'],
 queryFn: getMe,
 enabled,
 retry: false,
 staleTime: 1000 * 60 * 5, // Cache for 5 minutes
 });
}
