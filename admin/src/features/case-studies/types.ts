import type { ListParams, CaseStudyOut } from '@/types/api.types';
export type { CaseStudyOut };

export interface CaseStudyListParams extends ListParams {
 industry?: string;
 is_featured?: boolean;
 ai_generated?: boolean;
}

export type CaseStudyListResponse = { items: CaseStudyOut[]; total: number; page: number; per_page: number };
