export interface ContentFilters {
 search?: string;
 status?: string;
 category?: string;
 industry?: string;
 is_featured?: boolean;
 page?: number;
 per_page?: number;
 sort_by?: string;
 sort_order?: 'asc' | 'desc';
}
