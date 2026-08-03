import { Filter, X } from 'lucide-react';
import { SearchInput } from './SearchInput';
import type { ContentFilters } from '@/types/filters';

interface ContentFilterBarProps {
 filters: ContentFilters;
 onChange: (key: keyof ContentFilters, value: any) => void;
 onReset: () => void;
 showCategory?: boolean;
 showIndustry?: boolean;
 showIsFeatured?: boolean;
 categories?: { label: string; value: string }[];
 industries?: { label: string; value: string }[];
}

export const ContentFilterBar = ({
 filters,
 onChange,
 onReset,
 showCategory = false,
 showIndustry = false,
 showIsFeatured = false,
 categories = [],
 industries = [],
}: ContentFilterBarProps) => {
 const hasActiveFilters = 
 !!filters.search || 
 !!filters.status || 
 !!filters.category || 
 !!filters.industry || 
 filters.is_featured !== undefined ||
 !!filters.sort_by;

 return (
 <div className="bg-white p-4 rounded-lg border border-border mb-6 flex flex-col gap-4">
 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
 
 {/* Search */}
 <div className="w-full sm:w-auto flex-1">
 <SearchInput 
 value={filters.search} 
 onChange={(val) => onChange('search', val)} 
 placeholder="Search..."
 />
 </div>

 {/* Filters */}
 <div className="w-full sm:w-auto flex flex-wrap gap-3 items-center">
 
 <div className="flex items-center gap-2 text-sm text-muted-foreground ">
 <Filter className="w-4 h-4" />
 <span className="hidden sm:inline">Filters:</span>
 </div>

 <select
 value={filters.status || ''}
 onChange={(e) => onChange('status', e.target.value)}
 className="text-sm border border-border rounded-md bg-white text-muted-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">All Statuses</option>
 <option value="draft">Draft</option>
 <option value="in_review">In review</option>
 <option value="changes_requested">Changes requested</option>
 <option value="approved">Approved</option>
 <option value="scheduled">Scheduled</option>
 <option value="published">Published</option>
 <option value="unpublished">Unpublished</option>
 <option value="archived">Archived</option>
 </select>

 {showCategory && (
 <select
 value={filters.category || ''}
 onChange={(e) => onChange('category', e.target.value)}
 className="text-sm border border-border rounded-md bg-white text-muted-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">All Categories</option>
 {categories.map((c) => (
 <option key={c.value} value={c.value}>{c.label}</option>
 ))}
 </select>
 )}

 {showIndustry && (
 <select
 value={filters.industry || ''}
 onChange={(e) => onChange('industry', e.target.value)}
 className="text-sm border border-border rounded-md bg-white text-muted-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">All Industries</option>
 {industries.map((i) => (
 <option key={i.value} value={i.value}>{i.label}</option>
 ))}
 </select>
 )}

 {showIsFeatured && (
 <select
 value={filters.is_featured === undefined ? '' : filters.is_featured ? 'true' : 'false'}
 onChange={(e) => {
 const val = e.target.value;
 onChange('is_featured', val === '' ? undefined : val === 'true');
 }}
 className="text-sm border border-border rounded-md bg-white text-muted-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">All Featured</option>
 <option value="true">Featured Only</option>
 <option value="false">Not Featured</option>
 </select>
 )}

 <select
 value={filters.sort_by ? `${filters.sort_by}:${filters.sort_order}` : ''}
 onChange={(e) => {
 const val = e.target.value;
 if (!val) {
 onChange('sort_by', '');
 onChange('sort_order', '');
 return;
 }
 const [by, order] = val.split(':');
 onChange('sort_by', by);
 onChange('sort_order', order);
 }}
 className="text-sm border border-border rounded-md bg-white text-muted-foreground py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">Sort: Default (Newest Updated)</option>
 <option value="updated_at:desc">Updated: Newest</option>
 <option value="updated_at:asc">Updated: Oldest</option>
 <option value="created_at:desc">Created: Newest</option>
 <option value="created_at:asc">Created: Oldest</option>
 <option value="title:asc">Title: A-Z</option>
 <option value="title:desc">Title: Z-A</option>
 </select>

 {hasActiveFilters && (
 <button
 onClick={onReset}
 className="text-sm flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
 >
 <X className="w-4 h-4" />
 Reset
 </button>
 )}

 </div>
 </div>
 </div>
 );
};
