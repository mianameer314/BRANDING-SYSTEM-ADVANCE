import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';
import type { UserOut, UserCreate, UserUpdate, UsersListParams, UsersResponse } from './types';

export const usersApi = {
 list: async (params: UsersListParams): Promise<UsersResponse> => {
 const { data } = await axiosInstance.get<UsersResponse>(API.users.list, { params });
 return data;
 },

 get: async (id: number): Promise<UserOut> => {
 const { data } = await axiosInstance.get<UserOut>(API.users.detail(id));
 return data;
 },

 create: async (user: UserCreate): Promise<UserOut> => {
 const { data } = await axiosInstance.post<UserOut>(API.users.create, user);
 return data;
 },

 update: async (id: number, user: UserUpdate): Promise<UserOut> => {
 const { data } = await axiosInstance.put<UserOut>(API.users.update(id), user);
 return data;
 },

 deactivate: async (id: number): Promise<void> => {
 await axiosInstance.delete(API.users.delete(id));
 },
};
