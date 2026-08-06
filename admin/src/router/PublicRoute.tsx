import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

/** Redirects authenticated users to /dashboard. Renders children (login/register) otherwise. */
export function PublicRoute() {
 const { isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
  return (
  <div className="flex h-screen items-center justify-center bg-background">
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
  );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full min-h-screen"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
