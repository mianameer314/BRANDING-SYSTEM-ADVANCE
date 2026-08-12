import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ForbiddenPage } from '@/components/errors/ForbiddenPage';
import { PermissionRoute } from '@/features/auth/components/PermissionRoute';

import { AuthPage } from '@/features/auth/AuthPage';
import { ProfilePage } from '@/features/auth/ProfilePage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

import { BlogsPage } from '@/features/blogs/BlogsPage';
import BlogFormPage from '@/features/blogs/BlogFormPage';

import { NewsPage } from '@/features/news/NewsPage';
import NewsFormPage from '@/features/news/NewsFormPage';

import { ProjectsPage } from '@/features/projects/ProjectsPage';
import ProjectFormPage from '@/features/projects/ProjectFormPage';

import { InsightsPage } from '@/features/insights/InsightsPage';
import InsightFormPage from '@/features/insights/InsightFormPage';

import { CaseStudiesPage } from '@/features/case-studies/CaseStudiesPage';
import CaseStudyFormPage from '@/features/case-studies/CaseStudyFormPage';

import { UsersPage } from '@/features/users/UsersPage';
import { UserFormPage } from '@/features/users/UserFormPage';

import { WebhooksPage } from '@/features/webhooks/pages/WebhooksPage';


import { WorkflowOverviewPage } from '@/features/operations/pages/WorkflowOverviewPage';

export const router = createBrowserRouter([
 {
 element: <PublicRoute />,
 children: [
 { path: '/login', element: <AuthPage /> },
 { path: '/register', element: <AuthPage /> },
 ],
 },
 {
 element: <ProtectedRoute />,
 children: [
 { path: '403', element: <ForbiddenPage /> },
 {
 element: <AppShell />,
 children: [
 { index: true, element: <Navigate to="/dashboard" replace /> },
 { path: 'dashboard', element: <DashboardPage /> },
 { path: 'profile', element: <ProfilePage /> },
 
 { path: 'blogs', element: <PermissionRoute permission="read_content"><BlogsPage /></PermissionRoute> },
 { path: 'blogs/create', element: <PermissionRoute permission="create"><BlogFormPage /></PermissionRoute> },
 { path: 'blogs/:slug/edit', element: <PermissionRoute permission="update"><BlogFormPage /></PermissionRoute> },
 
 { path: 'news', element: <PermissionRoute permission="read_content"><NewsPage /></PermissionRoute> },
 { path: 'news/create', element: <PermissionRoute permission="create"><NewsFormPage /></PermissionRoute> },
 { path: 'news/:slug/edit', element: <PermissionRoute permission="update"><NewsFormPage /></PermissionRoute> },
 
 { path: 'projects', element: <PermissionRoute permission="read_content"><ProjectsPage /></PermissionRoute> },
 { path: 'projects/create', element: <PermissionRoute permission="create"><ProjectFormPage /></PermissionRoute> },
 { path: 'projects/:slug/edit', element: <PermissionRoute permission="update"><ProjectFormPage /></PermissionRoute> },
 
 { path: 'insights', element: <PermissionRoute permission="read_content"><InsightsPage /></PermissionRoute> },
 { path: 'insights/create', element: <PermissionRoute permission="create"><InsightFormPage /></PermissionRoute> },
 { path: 'insights/:slug/edit', element: <PermissionRoute permission="update"><InsightFormPage /></PermissionRoute> },
 
 { path: 'case-studies', element: <PermissionRoute permission="read_content"><CaseStudiesPage /></PermissionRoute> },
 { path: 'case-studies/create', element: <PermissionRoute permission="create"><CaseStudyFormPage /></PermissionRoute> },
 { path: 'case-studies/:slug/edit', element: <PermissionRoute permission="update"><CaseStudyFormPage /></PermissionRoute> },
 
 { path: 'users', element: <PermissionRoute permission="manage_users"><UsersPage /></PermissionRoute> },
 { path: 'users/create', element: <PermissionRoute permission="manage_users"><UserFormPage /></PermissionRoute> },
 { path: 'users/:id/edit', element: <PermissionRoute permission="manage_users"><UserFormPage /></PermissionRoute> },
 
 { path: 'operations', element: <Navigate to="/dashboard" replace /> },
 { path: 'operations/workflow', element: <PermissionRoute permission="read_content"><WorkflowOverviewPage /></PermissionRoute> },
 
 { path: 'webhooks', element: <PermissionRoute permission="manage_webhooks"><WebhooksPage /></PermissionRoute> },
 ],
 },
 ],
 },
 {
 path: '*',
 element: <Navigate to="/dashboard" replace />,
 },
]);
