/**
 * ContentFormLayout — two-column responsive grid for all form pages.
 *
 * Left column (wider): main content fields (title, content, body text)
 * Right column (narrower): metadata sidebar (status, category, image, etc.)
 */
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        type="button"
                        className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors group flex-shrink-0"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
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
