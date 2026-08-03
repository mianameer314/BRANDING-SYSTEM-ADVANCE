import type { ContentInteractionMixin } from './common';

export interface BlogOut extends ContentInteractionMixin {
  id: number;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
