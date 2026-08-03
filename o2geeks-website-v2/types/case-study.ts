import type { ContentInteractionMixin, MetricItem } from './common';

export interface CaseStudyOut extends ContentInteractionMixin {
  id: number;
  title: string;
  slug: string;
  client_name: string;
  client_logo: string | null;
  industry: string | null;
  challenge: string;
  solution: string;
  results: string;
  metrics: MetricItem[] | null;
  testimonial: string | null;
  testimonial_author: string | null;
  cover_image: string | null;
  gallery: string[] | null;
  technologies: string[] | null;
  is_featured: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
