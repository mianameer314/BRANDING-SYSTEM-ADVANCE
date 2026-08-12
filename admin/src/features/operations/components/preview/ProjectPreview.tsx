import { format } from 'date-fns';

export function ProjectPreview({ data }: { data: any }) {
  const technologies = Array.isArray(data.technologies) ? data.technologies.join(', ') : (data.technologies || 'N/A');

  return (
    <div className="font-sans antialiased text-[#131415] bg-[#f9f9f9] min-h-screen">
      {/* common-banner position-relative */}
      <div className="relative w-full h-[500px] flex flex-col justify-end">
        {/* SharedImage Background */}
        {data.cover_image ? (
          <img src={data.cover_image} alt={data.name || data.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-white/30 text-2xl font-bold">No Cover Image</span>
          </div>
        )}
        {/* banner-overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* container-lg */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
          {/* Top row: icon + paragraph */}
          <div className="max-w-2xl flex gap-6 mb-8">
            <div className="flex-shrink-0 w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-xl">*</span> {/* Placeholder for AnimatedIcon */}
            </div>
            <p className="text-white/70 text-lg m-0">
              {data.short_desc || (
                <>
                  <span className="opacity-70">A</span>
                  <span className="text-primary opacity-100"> showcase of creativity</span>
                  <span className="opacity-70">, strategy, and engineering results.</span>
                </>
              )}
            </p>
          </div>

          {/* Bottom row: title + badge */}
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-end mt-3 md:mt-6">
            <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight m-0">
              {data.name || data.title || 'Untitled Project'}
            </h1>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16">
        
        {/* Metadata Strip */}
        <div className="flex flex-wrap gap-10 mt-10">
          <div className="pr-10 md:border-r border-gray-300">
            <p className="text-sm font-semibold text-[#131415]/70 m-0">Technologies</p>
            <div className="mt-2">
              <span className="text-lg font-medium">{technologies}</span>
            </div>
          </div>
          <div className="pr-10 md:border-r border-gray-300">
            <p className="text-sm font-semibold text-[#131415]/70 m-0">Category</p>
            <div className="mt-2">
              <span className="text-lg font-medium">{data.category || 'N/A'}</span>
            </div>
          </div>
          <div className="pr-10 md:border-r border-gray-300">
            <p className="text-sm font-semibold text-[#131415]/70 m-0">Client</p>
            <div className="mt-2">
              <span className="text-lg font-medium">{data.client || data.client_name || 'Internal'}</span>
            </div>
          </div>
          {data.project_url && (
            <div className="pr-10 md:border-r border-gray-300">
              <p className="text-sm font-semibold text-[#131415]/70 m-0">Website</p>
              <div className="mt-2">
                <a href={data.project_url} target="_blank" rel="noreferrer" className="text-primary text-lg font-medium underline">
                  Visit Site ↗
                </a>
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-[#131415]/70 m-0">Completed</p>
            <div className="mt-2">
              <span className="text-lg font-medium">
                {data.published_at ? format(new Date(data.published_at), 'MMM yyyy') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="my-16 h-px w-full bg-gray-200"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="lg:col-span-4">
            <h2 className="text-4xl font-bold text-[#131415]">The Details</h2>
          </div>
          <div className="lg:col-span-8">
             <article 
               className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl text-[#131415] leading-[1.8]"
               dangerouslySetInnerHTML={{ __html: data.description || data.body || '<p class="text-gray-400 italic">Empty body content...</p>' }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
