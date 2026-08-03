import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import type { Permission } from '@/types/permissions';

interface PermissionRouteProps {
 permission: Permission;
 children: ReactNode;
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
 const hasAccess = usePermission(permission);

 if (!hasAccess) {
 return <Navigate to="/403" replace />;
 }

 return <>{children}</>;
}
