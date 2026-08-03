import type { ListParams, NewsOut } from '@/types/api.types';
export type { NewsOut };

export interface NewsListParams extends ListParams {
 is_featured?: boolean;
}
