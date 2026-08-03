import type { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import type { Permission } from '@/types/permissions';

interface BaseProps {
 fallback?: ReactNode;
 children: ReactNode;
}

interface SinglePermissionProps extends BaseProps {
 permission: Permission;
 permissions?: never;
 mode?: never;
}

interface MultiplePermissionsProps extends BaseProps {
 permission?: never;
 permissions: Permission[];
 mode?: 'all' | 'any';
}

type PermissionGuardProps = SinglePermissionProps | MultiplePermissionsProps;

export function PermissionGuard(props: PermissionGuardProps) {
 const { user } = useAuth();
 const { fallback = null, children } = props;

 const userPermissions = user?.permissions ?? [];

 let hasAccess = false;

 if (props.permission) {
 hasAccess = userPermissions.includes(props.permission);
 } else if (props.permissions && props.permissions.length > 0) {
 if (props.mode === 'all') {
 hasAccess = props.permissions.every((p) => userPermissions.includes(p));
 } else {
 // mode === 'any' or default
 hasAccess = props.permissions.some((p) => userPermissions.includes(p));
 }
 }

 return hasAccess ? <>{children}</> : <>{fallback}</>;
}
