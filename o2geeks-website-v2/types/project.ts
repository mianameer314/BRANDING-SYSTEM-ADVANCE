import type { ContentInteractionMixin } from './common';

export interface ProjectOut extends ContentInteractionMixin {
  id: number;
  name: string;
  slug: string;
  client: string | null;
  description: string;
  short_desc: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  technologies: string[] | null;
  category: string | null;
  project_url: string | null;
  is_featured: boolean;
  status: string;
  completed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
