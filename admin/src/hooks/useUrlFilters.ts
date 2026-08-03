import { useSearchParams } from 'react-router-dom';
import type { ContentFilters } from '@/types/filters';

export const useUrlFilters = () => {
 const [searchParams, setSearchParams] = useSearchParams();

 const filters: ContentFilters = {
 search: searchParams.get('search') || undefined,
 status: searchParams.get('status') || undefined,
 category: searchParams.get('category') || undefined,
 industry: searchParams.get('industry') || undefined,
 is_featured: searchParams.has('is_featured') ? searchParams.get('is_featured') === 'true' : undefined,
 page: parseInt(searchParams.get('page') || '1', 10),
 per_page: parseInt(searchParams.get('per_page') || '10', 10),
 sort_by: searchParams.get('sort_by') || undefined,
 sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || undefined,
 };

 const setFilter = (key: keyof ContentFilters, value: any) => {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev);
 
 if (value === undefined || value === null || value === '') {
 next.delete(key);
 } else {
 next.set(key, String(value));
 }

 // If any filter changes that isn't pagination, we should probably reset to page 1
 if (key !== 'page' && key !== 'per_page') {
 next.set('page', '1');
 }

 return next;
 }, { replace: true });
 };

 const resetFilters = () => {
 setSearchParams(new URLSearchParams(), { replace: true });
 };

 return { filters, setFilter, resetFilters };
};
