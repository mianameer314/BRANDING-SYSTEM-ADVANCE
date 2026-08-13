import type { ListParams, NewsOut } from '@/types/api.types';
export type { NewsOut };

export interface NewsListParams extends ListParams {
 is_featured?: boolean;
 ai_generated?: boolean;
}

export type NewsListResponse = { items: NewsOut[]; total: number; page: number; per_page: number };
