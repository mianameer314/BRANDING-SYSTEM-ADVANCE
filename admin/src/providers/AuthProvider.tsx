/* eslint-disable react-refresh/only-export-components */
import {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useMemo,
 useState,
 type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/config/env';
import type { TokenResponse, UserOut } from '@/types/api.types';
import { axiosInstance } from '@/api/axios';
import { API } from '@/api/endpoints';

interface AuthContextValue {
 user: UserOut | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 login: (tokens: TokenResponse) => Promise<void>;
 logout: () => void;
 updateUser: (data: UserOut) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
 const queryClient = useQueryClient();
 const [user, setUser] = useState<UserOut | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 const fetchMe = useCallback(async () => {
 try {
 const { data } = await axiosInstance.get<UserOut>(API.auth.me);
 setUser(data);
 } catch {
 localStorage.removeItem(env.tokenStorageKey);
 localStorage.removeItem(env.refreshTokenStorageKey);
 setUser(null);
 } finally {
 setIsLoading(false);
 }
 }, []);

 // On mount: if a token exists in storage, try to restore session
 useEffect(() => {
 const token = localStorage.getItem(env.tokenStorageKey);
 if (token) {
 void fetchMe();
 } else {
 setIsLoading(false);
 }
 }, [fetchMe]);

 const logout = useCallback(() => {
 localStorage.removeItem(env.tokenStorageKey);
 localStorage.removeItem(env.refreshTokenStorageKey);
 setUser(null);
 queryClient.clear();
 }, [queryClient]);

 // Listen for the custom logout event triggered by the axios interceptor
 useEffect(() => {
 const handleLogout = () => {
 logout();
 };
 window.addEventListener('auth:logout', handleLogout);
 return () => window.removeEventListener('auth:logout', handleLogout);
 }, [logout]);

 const login = useCallback(async (tokens: TokenResponse) => {
 localStorage.setItem(env.tokenStorageKey, tokens.access_token);
 localStorage.setItem(env.refreshTokenStorageKey, tokens.refresh_token);
 const { data } = await axiosInstance.get<UserOut>(API.auth.me);
 setUser(data);
 }, []);

 const updateUser = useCallback((data: UserOut) => {
 setUser(data);
 }, []);

 const value = useMemo(
 () => ({ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }),
 [user, isLoading, login, logout, updateUser]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
 return ctx;
}
