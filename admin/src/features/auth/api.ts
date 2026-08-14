import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { 
 LoginRequest, 
 TokenResponse, 
 UserOut, 
 RegisterRequest, 
 UpdateProfileRequest, 
 ChangePasswordRequest,
 VerifyEmailRequest,
 ResendOtpRequest,
 ForgotPasswordRequest,
 ResetPasswordRequest
} from '@/types/api.types';

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
 const { data } = await axiosInstance.post<TokenResponse>(API.auth.login, credentials);
 return data;
}

export async function register(payload: RegisterRequest): Promise<UserOut> {
 const { data } = await axiosInstance.post<UserOut>(API.auth.register, payload);
 return data;
}

export async function getMe(): Promise<UserOut> {
 const { data } = await axiosInstance.get<UserOut>(API.auth.me);
 return data;
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<UserOut> {
 const { data } = await axiosInstance.put<UserOut>(API.auth.me, payload);
 return data;
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
 await axiosInstance.post(API.auth.changePassword, payload);
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(API.auth.verifyEmail, data);
    return response.data;
}

export async function resendOtp(data: ResendOtpRequest): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(API.auth.resendOtp, data);
    return response.data;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(API.auth.forgotPassword, data);
    return response.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(API.auth.resetPassword, data);
    return response.data;
}
