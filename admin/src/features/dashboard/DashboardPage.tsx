import { FileText, Newspaper, Briefcase, Lightbulb, Trophy } from 'lucide-react';
import { useBlogs } from '@/features/blogs/hooks';
import { useNews } from '@/features/news/hooks';
import { useProjects } from '@/features/projects/hooks';
import { useInsights } from '@/features/insights/hooks';
import { useCaseStudies } from '@/features/case-studies/hooks';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { CountUp } from '@/components/ui/CountUp';

interface StatCardProps {
 icon: React.ElementType;
 label: string;
 value: number | undefined;
 published: number | undefined;
 draft: number | undefined;
 isLoading: boolean;
 color: string;
 to: string;
}

function StatCard({ icon: Icon, label, value, published, draft, isLoading, color, to }: StatCardProps) {
 return (
 <Link
 to={to}
 className="o2-card-3d group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:bg-accent flex flex-col justify-between"
 >
 {/* Glow accent */}
 <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity', color)} />

 <div className="relative flex items-start justify-between">
 <div>
 <p className="text-sm text-muted-foreground">{label}</p>
 <p className="mt-2 text-3xl font-bold text-foreground">
 {isLoading ? (
 <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-accent" />
 ) : (
 value !== undefined ? <CountUp end={value} /> : '—'
 )}
 </p>
 </div>
 <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', color, 'bg-opacity-15')}>
 <Icon size={20} className={cn(color.replace('bg-', 'text-'))} />
 </div>
 </div>

 {/* Breakdowns */}
 <div className="relative mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
 <div className="flex items-center gap-1.5">
 <div className="h-2 w-2 rounded-full bg-success/80" />
 <span>Published: <strong className="text-foreground">{!isLoading && published !== undefined ? <CountUp end={published} duration={700} /> : '—'}</strong></span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="h-2 w-2 rounded-full bg-warning/80" />
 <span>Draft: <strong className="text-foreground">{!isLoading && draft !== undefined ? <CountUp end={draft} duration={700} /> : '—'}</strong></span>
 </div>
 </div>
 </Link>
 );
}

export function DashboardPage() {
 const { data: blogs, isLoading: blogsLoading } = useBlogs({ per_page: 1 });
 const { data: blogsPub } = useBlogs({ per_page: 1, status: 'published' });
 const { data: blogsDraft } = useBlogs({ per_page: 1, status: 'draft' });

 const { data: news, isLoading: newsLoading } = useNews({ per_page: 1 });
 const { data: newsPub } = useNews({ per_page: 1, status: 'published' });
 const { data: newsDraft } = useNews({ per_page: 1, status: 'draft' });

 const { data: projects, isLoading: projectsLoading } = useProjects({ per_page: 1 });
 const { data: projectsPub } = useProjects({ per_page: 1, status: 'published' });
 const { data: projectsDraft } = useProjects({ per_page: 1, status: 'draft' });

 const { data: insights, isLoading: insightsLoading } = useInsights({ per_page: 1 });
 const { data: insightsPub } = useInsights({ per_page: 1, status: 'published' });
 const { data: insightsDraft } = useInsights({ per_page: 1, status: 'draft' });

 const { data: caseStudies, isLoading: caseStudiesLoading } = useCaseStudies({ per_page: 1 });
 const { data: caseStudiesPub } = useCaseStudies({ per_page: 1, status: 'published' });
 const { data: caseStudiesDraft } = useCaseStudies({ per_page: 1, status: 'draft' });

 const stats: StatCardProps[] = [
 { icon: FileText, label: 'Total Blogs', value: blogs?.total, published: blogsPub?.total, draft: blogsDraft?.total, isLoading: blogsLoading, color: 'bg-primary', to: '/blogs' },
 { icon: Newspaper, label: 'Total News', value: news?.total, published: newsPub?.total, draft: newsDraft?.total, isLoading: newsLoading, color: 'bg-info', to: '/news' },
 { icon: Briefcase, label: 'Total Projects', value: projects?.total, published: projectsPub?.total, draft: projectsDraft?.total, isLoading: projectsLoading, color: 'bg-success', to: '/projects' },
 { icon: Lightbulb, label: 'Total Insights', value: insights?.total, published: insightsPub?.total, draft: insightsDraft?.total, isLoading: insightsLoading, color: 'bg-warning', to: '/insights' },
 { icon: Trophy, label: 'Case Studies', value: caseStudies?.total, published: caseStudiesPub?.total, draft: caseStudiesDraft?.total, isLoading: caseStudiesLoading, color: 'bg-destructive', to: '/case-studies' },
 ];

 return (
 <div className="space-y-8">
 {/* Welcome */}
 <div>
 <h2 className="text-xl font-semibold text-foreground">Overview</h2>
 <p className="mt-1 text-sm text-muted-foreground">
 Live content counts from your backend.
 </p>
 </div>

 {/* Stat grid */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
 {stats.map((s) => (
 <StatCard key={s.label} {...s} />
 ))}
 </div>
 </div>
 );
}
