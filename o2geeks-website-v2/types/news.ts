import type { ContentInteractionMixin } from './common';

export interface NewsOut extends ContentInteractionMixin {
  id: number;
  headline: string;
  slug: string;
  summary: string;
  cover_image: string | null;
  source: string | null;
  is_featured: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
