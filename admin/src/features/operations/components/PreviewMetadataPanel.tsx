import { Settings2, Tag, Search, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface PreviewMetadataPanelProps {
  data: any;
}

export function PreviewMetadataPanel({ data }: PreviewMetadataPanelProps) {
  return (
    <div className="w-80 bg-card border-l border-border/50 shadow-sm h-full overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-4 border-b border-border/50 sticky top-0 bg-card/90 backdrop-blur z-10">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          Metadata & SEO
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Publication Status */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            Publication
          </h4>
          <div className="bg-muted/20 border border-border/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold capitalize">{data.status || 'Draft'}</span>
            </div>
            {data.published_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published:</span>
                <span className="font-medium text-xs mt-0.5">{format(new Date(data.published_at), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Author ID:</span>
              <span className="font-medium">{data.owner_id || 'System'}</span>
            </div>
          </div>
        </div>

        {/* SEO Data */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            SEO Optimization
          </h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Meta Title</p>
              <p className="text-sm font-medium border border-border/50 rounded-md p-2 bg-muted/10 leading-snug">
                {data.seo_title || <span className="text-destructive/80 italic text-xs">Missing SEO Title</span>}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Meta Description</p>
              <p className="text-xs border border-border/50 rounded-md p-2 bg-muted/10 leading-relaxed text-muted-foreground h-20 overflow-y-auto">
                {data.seo_description || <span className="text-destructive/80 italic">Missing SEO Description</span>}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {data.seo_keywords && data.seo_keywords.length > 0 ? (
                  data.seo_keywords.map((kw: string) => (
                    <span key={kw} className="text-[10px] font-medium bg-primary/10 text-primary-foreground px-2 py-0.5 rounded border border-primary/20">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-destructive/80 italic text-xs">No keywords</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Classification
          </h4>
          <div className="bg-muted/20 border border-border/50 rounded-lg p-3 space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Category:</span>
              <span className="font-semibold bg-background border px-2 py-0.5 rounded text-xs">{data.category || 'None'}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {data.tags && data.tags.length > 0 ? (
                  data.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic opacity-50">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
