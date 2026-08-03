import type { ListParams, InsightOut } from '@/types/api.types';
export type { InsightOut };

export interface InsightListParams extends ListParams {
 category?: string;
}
