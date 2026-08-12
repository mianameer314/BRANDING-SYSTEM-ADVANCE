export function CaseStudyPreview({ data }: { data: any }) {
  const technologies = Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies;

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
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 flex flex-col gap-6">
          
          <div className="flex justify-between items-end">
            <div className="max-w-3xl">
              {/* Top row: icon + paragraph */}
              <div className="flex gap-6 mb-8 items-center">
                <div className="flex-shrink-0 w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">*</span>
                </div>
                {data.client_name && (
                  <p className="text-white/70 text-lg m-0">
                    {data.client_name} Success Story
                  </p>
                )}
              </div>

              {/* Bottom row: title + badge */}
              {data.title && (
                <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight m-0">
                  {data.title}
                </h1>
              )}
              {data.is_featured && (
                <div className="mt-6">
                  <span className="bg-yellow-500 text-black px-3 py-1 text-sm font-semibold rounded-md uppercase tracking-wider">
                    Featured Case Study
                  </span>
                </div>
              )}
            </div>
            
            {/* Client Logo */}
            {data.client_logo && (
              <div className="hidden md:block bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <img src={data.client_logo} alt={`${data.client_name} logo`} className="h-16 w-auto object-contain brightness-0 invert opacity-90" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Study Details */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16">
        
        {/* Metadata Strip */}
        <div className="flex flex-wrap gap-10 mt-10">
          {technologies && (
            <div className="pr-10 md:border-r border-gray-300">
              <p className="text-sm font-semibold text-[#131415]/70 m-0">Technologies</p>
              <div className="mt-2">
                <span className="text-lg font-medium">{technologies}</span>
              </div>
            </div>
          )}
          {data.client_name && (
            <div className="pr-10 md:border-r border-gray-300">
              <p className="text-sm font-semibold text-[#131415]/70 m-0">Client</p>
              <div className="mt-2 flex items-center gap-3">
                {data.client_logo && (
                  <img src={data.client_logo} alt="logo" className="h-6 w-auto object-contain grayscale" />
                )}
                <span className="text-lg font-medium">{data.client_name}</span>
              </div>
            </div>
          )}
          {data.industry && (
            <div>
              <p className="text-sm font-semibold text-[#131415]/70 m-0">Industry</p>
              <div className="mt-2">
                <span className="text-lg font-medium">{data.industry}</span>
              </div>
            </div>
          )}
        </div>

        <div className="my-16 h-px w-full bg-gray-200"></div>

        {/* Metrics Grid */}
        {data.metrics && data.metrics.length > 0 && (
          <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.metrics.map((metric: any, idx: number) => (
              <div key={idx} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-primary mb-2">{metric.value || metric.number || '-'}</div>
                <div className="text-sm font-bold text-[#131415]/70 uppercase tracking-wider">{metric.label || metric.name || 'Metric'}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* THE CHALLENGE */}
          {data.challenge && (
            <>
              <div className="lg:col-span-4">
                <h2 className="text-4xl font-bold text-[#131415]">The Challenge</h2>
              </div>
              <div className="lg:col-span-8">
                <article 
                  className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl text-[#131415] leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: data.challenge }}
                />
              </div>
            </>
          )}

          {/* OUR SOLUTION */}
          {data.solution && (
            <>
              <div className="lg:col-span-4 mt-8 lg:mt-16">
                <h2 className="text-4xl font-bold text-[#131415]">Our Solution</h2>
              </div>
              <div className="lg:col-span-8 mt-8 lg:mt-16">
                <article 
                  className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl text-[#131415] leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: data.solution }}
                />
              </div>
            </>
          )}

          {/* THE RESULTS */}
          {data.results && (
            <>
              <div className="lg:col-span-4 mt-8 lg:mt-16">
                <h2 className="text-4xl font-bold text-[#131415]">The Results</h2>
              </div>
              <div className="lg:col-span-8 mt-8 lg:mt-16">
                <article 
                  className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl text-[#131415] leading-[1.8]"
                  dangerouslySetInnerHTML={{ __html: data.results }}
                />
              </div>
            </>
          )}
        </div>

        {/* Testimonial */}
        {data.testimonial && (
          <div className="my-24 bg-[#131415] text-white rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[200px] text-white/5 font-serif leading-none mt-4">"</div>
            <p className="text-2xl md:text-4xl font-medium leading-relaxed relative z-10 italic mb-8">
              "{data.testimonial}"
            </p>
            {data.testimonial_author && (
              <p className="text-lg text-white/70 font-bold uppercase tracking-widest relative z-10">
                — {data.testimonial_author}
              </p>
            )}
          </div>
        )}

        {/* Gallery */}
        {data.gallery && data.gallery.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-4xl font-bold text-[#131415] mb-8">Media & Assets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.gallery.map((imgUrl: string, idx: number) => (
                <div key={idx} className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <img src={imgUrl} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
