import { useMutation, useQuery } from '@tanstack/react-query';
import { login, register, getMe, updateProfile, changePassword, verifyEmail, resendOtp, forgotPassword, resetPassword } from './api';
import type { LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest, VerifyEmailRequest, ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/api.types';

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
        mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    });
}

export function useVerifyEmail() {
    return useMutation({
        mutationFn: (data: VerifyEmailRequest) => verifyEmail(data),
    });
}

export function useResendOtp() {
    return useMutation({
        mutationFn: (data: ResendOtpRequest) => resendOtp(data),
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
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
