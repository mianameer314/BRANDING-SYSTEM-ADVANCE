/**
 * ContentFormLayout — two-column responsive grid for all form pages.
 *
 * Left column (wider): main content fields (title, content, body text)
 * Right column (narrower): metadata sidebar (status, category, image, etc.)
 */
import type { ReactNode } from 'react';

interface ContentFormLayoutProps {
    title: string;
    subtitle?: string;
    mainColumn: ReactNode;
    sideColumn: ReactNode;
    headerAction?: ReactNode;
}

export function ContentFormLayout({
    title,
    subtitle,
    mainColumn,
    sideColumn,
    headerAction,
}: ContentFormLayoutProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {headerAction && (
                    <div>{headerAction}</div>
                )}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                {/* Main content column */}
                <div className="flex flex-col gap-5">{mainColumn}</div>

                {/* Sidebar / metadata column */}
                <div className="flex flex-col gap-5">
                    <div className="rounded-xl border border-border bg-input/50 p-5 flex flex-col gap-5">
                        {sideColumn}
                    </div>
                </div>
            </div>
        </div>
    );
}
