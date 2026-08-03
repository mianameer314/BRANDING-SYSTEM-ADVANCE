import type { ListParams, CaseStudyOut } from '@/types/api.types';
export type { CaseStudyOut };

export interface CaseStudyListParams extends ListParams {
 industry?: string;
 is_featured?: boolean;
}
