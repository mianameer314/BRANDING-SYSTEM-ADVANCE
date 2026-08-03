export interface MetricItem {
  label: string;
  value: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ContentInteractionMixin {
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}
