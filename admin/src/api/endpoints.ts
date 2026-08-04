/**
 * Centralized API endpoint paths.
 *
 * Contains ONLY path segments — never full URLs.
 * The Axios instance baseURL (from env.ts) handles the base.
 */

export const API = {
 auth: {
 register: '/auth/register',
 login: '/auth/login',
 refresh: '/auth/refresh',
 me: '/auth/me',
 changePassword: '/auth/change-password',
 },
 blogs: {
 list: '/blogs',
 detail: (slug: string) => `/blogs/${slug}`,
 create: '/blogs',
 update: (id: number) => `/blogs/${id}`,
 delete: (id: number) => `/blogs/${id}`,
 },
 news: {
 list: '/news',
 detail: (slug: string) => `/news/${slug}`,
 create: '/news',
 update: (id: number) => `/news/${id}`,
 delete: (id: number) => `/news/${id}`,
 },
 projects: {
 list: '/projects',
 detail: (slug: string) => `/projects/${slug}`,
 create: '/projects',
 update: (id: number) => `/projects/${id}`,
 delete: (id: number) => `/projects/${id}`,
 },
 insights: {
 list: '/insights',
 detail: (slug: string) => `/insights/${slug}`,
 create: '/insights',
 update: (id: number) => `/insights/${id}`,
 delete: (id: number) => `/insights/${id}`,
 },
 caseStudies: {
 list: '/case-studies',
 detail: (slug: string) => `/case-studies/${slug}`,
 create: '/case-studies',
 update: (id: number) => `/case-studies/${id}`,
 delete: (id: number) => `/case-studies/${id}`,
 },
 users: {
 list: '/users',
 detail: (id: number) => `/users/${id}`,
 create: '/users',
 update: (id: number) => `/users/${id}`,
 delete: (id: number) => `/users/${id}`,
 },
 resources: {
 create: '/resources',
 listContent: (contentType: string, contentId: number) => `/resources/content/${contentType}/${contentId}`,
 update: (id: number) => `/resources/${id}`,
 delete: (id: number) => `/resources/${id}`,
 download: (id: number) => `/resources/${id}/download`,
 },
 ai: {
 generate: '/ai/generate',
 },
 webhooks: {
 list: '/webhooks',
 create: '/webhooks',
 detail: (id: number) => `/webhooks/${id}`,
 update: (id: number) => `/webhooks/${id}`,
 delete: (id: number) => `/webhooks/${id}`,
 logs: (id: number) => `/webhooks/${id}/logs`,
  test: (id: number) => `/webhooks/${id}/test`,
 },
 audit: {
   revisions: (contentType: string, contentId: number) => `/audit/content/${contentType}/${contentId}/revisions`,
   restore: (contentType: string, contentId: number, version: number) => `/audit/content/${contentType}/${contentId}/revisions/${version}/restore`,
 },
} as const;
