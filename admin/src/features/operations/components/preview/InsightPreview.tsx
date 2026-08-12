import { format } from 'date-fns';

export function InsightPreview({ data }: { data: any }) {
  const tagsList = typeof data.tags === 'string' ? data.tags.split(',') : (Array.isArray(data.tags) ? data.tags : []);

  return (
    <div className="font-sans antialiased text-[#131415] bg-[#f9f9f9] min-h-screen">
      {/* common-banner position-relative */}
      <div className="relative w-full h-[500px] flex flex-col justify-end">
        {/* SharedImage Background */}
        {data.cover_image && (
          <img src={data.cover_image} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {!data.cover_image && (
          <div className="absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center">
            {/* Empty state background */}
          </div>
        )}
        {/* banner-overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* container-lg */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
          {/* Top row: icon + paragraph */}
          <div className="max-w-2xl flex gap-6 mb-8">
            <div className="flex-shrink-0 w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-xl">*</span>
            </div>
          </div>

          {/* Bottom row: title + badge */}
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-end mt-3 md:mt-6">
            <div>
              {data.title && (
                <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight m-0">
                  {data.title}
                </h1>
              )}
              <div className="flex gap-4 mt-6 items-center flex-wrap">
                {data.category && (
                  <span className="bg-primary text-white px-3 py-1 text-sm font-semibold rounded-md">
                    {data.category}
                  </span>
                )}
                {data.published_at && (
                  <span className="text-white/50 text-sm font-medium">
                    {format(new Date(data.published_at), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-4xl font-bold text-[#131415] mb-8">Data & Research</h2>
          </div>
          
          <div className="lg:col-span-8">
            {data.excerpt && (
              <p className="text-xl text-[#131415]/70 mb-12">
                {data.excerpt}
              </p>
            )}
            
            {/* body markdown */}
            {data.content && (
              <article 
                className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl text-[#131415] leading-[1.8]"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
          </div>
        </div>
        
        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#131415]/70 mr-2">Tags:</span>
              {tagsList.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 border border-[#131415] text-[#131415] rounded-full text-xs font-semibold"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
