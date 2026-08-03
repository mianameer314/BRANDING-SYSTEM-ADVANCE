import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

/** Redirects unauthenticated users to /login. Renders children otherwise. */
export function ProtectedRoute() {
 const { isAuthenticated, isLoading } = useAuth();

 // Show nothing while restoring session from localStorage
 if (isLoading) {
 return (
 <div className="flex h-screen items-center justify-center bg-background">
 <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
 </div>
 );
 }

 return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
