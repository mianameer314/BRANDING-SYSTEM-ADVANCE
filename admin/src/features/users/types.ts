import type { UserRole, UserOut, PaginatedResponse, ListParams } from '@/types/api.types';

export type { UserOut };

export interface UserCreate {
 full_name: string;
 email: string;
 password?: string;
 role: UserRole;
}

export interface UserUpdate {
 full_name?: string;
 role?: UserRole;
 is_active?: boolean;
}

export interface UsersListParams extends ListParams {
 search?: string;
}

export type UsersResponse = PaginatedResponse<UserOut>;
