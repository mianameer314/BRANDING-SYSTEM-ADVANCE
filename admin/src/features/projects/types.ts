import type { ListParams, ProjectOut } from '@/types/api.types';
export type { ProjectOut };

export interface ProjectListParams extends ListParams {
 category?: string;
 is_featured?: boolean;
}
