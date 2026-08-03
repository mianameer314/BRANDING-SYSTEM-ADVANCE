import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { 
 LoginRequest, 
 TokenResponse, 
 UserOut, 
 RegisterRequest, 
 UpdateProfileRequest, 
 ChangePasswordRequest 
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
