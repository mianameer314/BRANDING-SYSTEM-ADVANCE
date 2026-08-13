/**
 * ContentFormLayout — two-column responsive grid for all form pages.
 *
 * Left column (wider): main content fields (title, content, body text)
 * Right column (narrower): metadata sidebar (status, category, image, etc.)
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

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
    const { setHeaderState } = useOutletContext<any>();

    useEffect(() => {
        setHeaderState({
            title,
            subtitle,
            showBackButton: true
        });
    }, [title, subtitle, setHeaderState]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            {headerAction && (
                <div className="flex items-center justify-end">
                    {headerAction}
                </div>
            )}

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
