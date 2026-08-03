import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

/** Redirects authenticated users to /dashboard. Renders children (login/register) otherwise. */
export function PublicRoute() {
 const { isAuthenticated, isLoading } = useAuth();

 if (isLoading) {
 return (
 <div className="flex h-screen items-center justify-center bg-background">
 <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
 </div>
 );
 }

 return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
