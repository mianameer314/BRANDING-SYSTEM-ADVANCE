export interface BlogGeneratedContent {
 title: string;
 excerpt: string;
 content: string;
 tags: string[];
 category: string;
 meta_description: string;
 seo_keywords: string[];
}

export interface NewsGeneratedContent {
 headline: string;
 summary: string;
 meta_description: string;
}

export interface ProjectGeneratedContent {
 name: string;
 description: string;
 short_desc: string;
 technologies: string[];
 category: string;
}

export interface InsightGeneratedContent {
 title: string;
 excerpt: string;
 content: string;
 tags: string[];
 category: string;
 meta_description: string;
}

export interface CaseStudyGeneratedContent {
 title: string;
 client_name: string;
 industry: string;
 challenge: string;
 solution: string;
 results: string;
 technologies: string[];
 metrics: Array<{ label: string; value: string }>;
 testimonial: string;
 testimonial_author: string;
}

export type GeneratedContent =
 | BlogGeneratedContent
 | NewsGeneratedContent
 | ProjectGeneratedContent
 | InsightGeneratedContent
 | CaseStudyGeneratedContent;

export interface GenerateContentRequest {
 content_type: 'blog' | 'news' | 'project' | 'insight' | 'case_study';
 topic: string;
 keywords?: string[];
 audience?: string;
 tone?: string;
 length?: string;
 language?: string;
 goal?: string;
 cta?: string;
 custom_instructions?: string;
 preset?: string;
}

export interface GenerateContentResponse {
 content_type: string;
 generated: GeneratedContent;
 model: string;
 generation_time_ms: number;
}
