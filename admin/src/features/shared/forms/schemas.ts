/**
 * Shared Zod schemas for all content creation and editing forms.
 *
 * Architecture: baseContentSchema is extended per-domain so shared fields
 * (status) are never duplicated. Validation rules mirror backend Pydantic
 * Field(..., max_length=N) constraints exactly.
 */
import { z } from 'zod';

// ── Shared base (applies to all content types) ─────────────────────────────

export const baseContentSchema = z.object({
 status: z.enum(['draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'unpublished', 'archived']),
 status_reason: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
});

// ── Blog ───────────────────────────────────────────────────────────────────
// Backend: BlogCreate → title (req,200), author (req,150), content (req),
// excerpt (opt,300), category (opt,100), tags (opt, JSON array),
// cover_image (opt, UploadFile), status (default: draft)

export const blogSchema = baseContentSchema.extend({
 title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
 author: z.string().min(1, 'Author is required').max(150, 'Max 150 characters'),
 content: z.string().min(1, 'Content is required'),
 excerpt: z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
 category: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
 tags: z.string().optional(), // comma-separated; serialized to JSON array on submit
 cover_image: z.instanceof(File).optional().nullable(),
});

export type BlogFormData = z.infer<typeof blogSchema>;

// ── News ───────────────────────────────────────────────────────────────────
// Backend: NewsCreate → headline (req,150), summary (req), source (opt,255),
// is_featured (default: false), cover_image (opt, UploadFile), status

export const newsSchema = baseContentSchema.extend({
 headline: z.string().min(1, 'Headline is required').max(150, 'Max 150 characters'),
 summary: z.string().min(1, 'Summary is required'),
 source: z.string().max(255, 'Max 255 characters').optional().or(z.literal('')),
 is_featured: z.boolean(),
 cover_image: z.instanceof(File).optional().nullable(),
});

export type NewsFormData = z.infer<typeof newsSchema>;

// ── Project ────────────────────────────────────────────────────────────────
// Backend: ProjectCreate → name (req,200), description (req), client (opt,200),
// short_desc (opt,300), technologies (opt, JSON array), category (opt,100),
// project_url (opt,500), is_featured (default: false), completed_at (opt, ISO),
// cover_image (opt, UploadFile), gallery (opt, list[UploadFile]), status

export const projectSchema = baseContentSchema.extend({
 name: z.string().min(1, 'Name is required').max(200, 'Max 200 characters'),
 description: z.string().min(1, 'Description is required'),
 client: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
 short_desc: z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
 technologies: z.string().optional(), // comma-separated; serialized to JSON array on submit
 category: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
 project_url: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
 is_featured: z.boolean(),
 completed_at: z.string().optional().or(z.literal('')), // ISO datetime string
 cover_image: z.instanceof(File).optional().nullable(),
 gallery: z.array(z.instanceof(File)).optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ── Insight ────────────────────────────────────────────────────────────────
// Backend: InsightCreate → title (req,200), author (req,150), content (req),
// excerpt (opt,300), category (opt,100), tags (opt, JSON array),
// cover_image (opt, UploadFile), status
// NOTE: Structurally identical to Blog — extends the same base fields.

export const insightSchema = baseContentSchema.extend({
 title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
 author: z.string().min(1, 'Author is required').max(150, 'Max 150 characters'),
 content: z.string().min(1, 'Content is required'),
 excerpt: z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
 category: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
 tags: z.string().optional(),
 cover_image: z.instanceof(File).optional().nullable(),
});

export type InsightFormData = z.infer<typeof insightSchema>;

// ── Case Study ─────────────────────────────────────────────────────────────
// Backend: CaseStudyCreate → title (req,200), client_name (req,200),
// challenge (req), solution (req), results (req),
// industry (opt,100), testimonial (opt), testimonial_author (opt,200),
// metrics (opt, JSON [{label,value}]), technologies (opt, JSON array),
// is_featured (default: false), cover_image (opt, UploadFile),
// client_logo (opt, UploadFile), gallery (opt, list[UploadFile]), status

export const metricItemSchema = z.object({
 label: z.string().min(1, 'Label is required'),
 value: z.string().min(1, 'Value is required'),
});

export const caseStudySchema = baseContentSchema.extend({
 title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
 client_name: z.string().min(1, 'Client name is required').max(200, 'Max 200 characters'),
 challenge: z.string().min(1, 'Challenge is required'),
 solution: z.string().min(1, 'Solution is required'),
 results: z.string().min(1, 'Results is required'),
 industry: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
 testimonial: z.string().optional().or(z.literal('')),
 testimonial_author: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
 metrics: z.array(metricItemSchema).optional(),
 technologies: z.string().optional(), // comma-separated; serialized to JSON array on submit
 is_featured: z.boolean(),
 cover_image: z.instanceof(File).optional().nullable(),
 client_logo: z.instanceof(File).optional().nullable(),
 gallery: z.array(z.instanceof(File)).optional(),
});

export type CaseStudyFormData = z.infer<typeof caseStudySchema>;
export type MetricItem = z.infer<typeof metricItemSchema>;
