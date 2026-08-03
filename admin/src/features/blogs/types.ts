import type { ListParams, BlogOut } from '@/types/api.types';
export type { BlogOut };

export interface BlogListParams extends ListParams {
 category?: string;
}

export type BlogListResponse = { items: BlogOut[]; total: number; page: number; per_page: number };
