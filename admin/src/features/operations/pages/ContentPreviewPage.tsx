import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { operationsApi } from '@/features/operations/api';
import { PreviewFrame } from '@/features/operations/components/PreviewFrame';
import { PreviewMetadataPanel } from '@/features/operations/components/PreviewMetadataPanel';
import { ValidationWarnings } from '@/features/operations/components/ValidationWarnings';
import { ArrowLeft, MonitorPlay, History } from 'lucide-react';

// Specific Previews
import { BlogPreview } from '@/features/operations/components/preview/BlogPreview';
import { NewsPreview } from '@/features/operations/components/preview/NewsPreview';
import { ProjectPreview } from '@/features/operations/components/preview/ProjectPreview';
import { InsightPreview } from '@/features/operations/components/preview/InsightPreview';
import { CaseStudyPreview } from '@/features/operations/components/preview/CaseStudyPreview';

export function ContentPreviewPage() {
  const { contentType, contentId } = useParams<{ contentType: string; contentId: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (contentType && contentId) {
      operationsApi.getPreviewToken(contentType, parseInt(contentId))
        .then(res => setToken(res.token))
        .catch(console.error);
    }
  }, [contentType, contentId]);

  const { data: previewResponse, isLoading, error } = useQuery({
    queryKey: ['preview', contentType, token],
    queryFn: () => operationsApi.getPreviewData(contentType!, token!),
    enabled: !!token && !!contentType,
  });

  if (isLoading || !token) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Generating website preview...</p>
      </div>
    );
  }

  if (error || !previewResponse) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-destructive/20 text-destructive mt-8 max-w-2xl mx-auto shadow-sm">
        <h3 className="text-xl font-bold mb-2">Error Loading Preview</h3>
        <p>Could not load the preview payload for this content.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent text-foreground">
          Go Back
        </button>
      </div>
    );
  }

  const data = previewResponse.content || {};

  const renderPreviewContent = () => {
    switch (contentType) {
      case 'blog': return <BlogPreview data={data} />;
      case 'news': return <NewsPreview data={data} />;
      case 'project': return <ProjectPreview data={data} />;
      case 'insight': return <InsightPreview data={data} />;
      case 'case_study': return <CaseStudyPreview data={data} />;
      default: return <div className="p-12 text-center text-muted-foreground">Unsupported content type for native preview.</div>;
    }
  };

  const getUrlPath = () => {
    const slug = data.slug || 'draft';
    switch (contentType) {
      case 'blog': return `/blog/${slug}`;
      case 'news': return `/news/${slug}`;
      case 'project': return `/work/${slug}`;
      case 'insight': return `/insights/${slug}`;
      case 'case_study': return `/case-studies/${slug}`;
      default: return `/${slug}`;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <MonitorPlay className="w-6 h-6 text-primary" />
              Website Preview
            </h2>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mt-1">
              Simulated Front-End Render
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/operations/revisions/${contentType}/${contentId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 text-foreground rounded-lg shadow-sm hover:shadow-md transition-all font-medium group"
          >
            <History className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            Revision History
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <ValidationWarnings data={data} contentType={contentType!} />
          <PreviewFrame urlPath={getUrlPath()}>
            {renderPreviewContent()}
          </PreviewFrame>
        </div>

        {/* SEO Sidebar */}
        <PreviewMetadataPanel data={data} />
      </div>
    </div>
  );
}
