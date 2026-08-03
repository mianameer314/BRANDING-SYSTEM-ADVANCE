import { useAuth } from '@/providers/AuthProvider';
import type { Permission } from '@/types/permissions';

export function usePermission(permission: Permission): boolean {
 const { user } = useAuth();
 return user?.permissions?.includes(permission) ?? false;
}
