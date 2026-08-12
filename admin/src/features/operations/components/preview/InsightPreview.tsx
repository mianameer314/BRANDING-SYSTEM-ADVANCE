import { format } from 'date-fns';

export function InsightPreview({ data }: { data: any }) {
  return (
    <div className="font-sans antialiased text-[#111] pb-24 bg-white min-h-full">
      {/* Header / Nav simulation */}
      <header className="h-16 flex items-center px-8 border-b border-gray-200">
        <div className="font-bold text-xl tracking-tight">O2Geeks Insights</div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 mt-16">
        {/* Category & Date */}
        <div className="flex items-center gap-4 text-sm font-bold tracking-wider text-blue-600 mb-6 uppercase">
          <span>{data.category || 'Analysis'}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{data.published_at ? format(new Date(data.published_at), 'MMMM d, yyyy') : 'Draft'}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.2] mb-8">
          {data.title || 'Untitled Insight'}
        </h1>

        {/* Excerpt as a highlight block */}
        <div className="border-l-4 border-blue-600 pl-6 mb-12">
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic">
            {data.excerpt || 'No summary provided.'}
          </p>
        </div>

        {/* Cover Image / Chart Placeholder */}
        {data.cover_image ? (
          <div className="w-full mb-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 p-2">
            <img src={data.cover_image} alt={data.title} className="w-full h-auto rounded-lg" />
          </div>
        ) : (
          <div className="w-full h-[400px] mb-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-gray-200 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-full max-w-sm h-48 border-b-2 border-l-2 border-gray-300 relative flex items-end justify-between px-4 pb-4">
               {/* Mock Chart Bars */}
               <div className="w-8 h-1/3 bg-blue-300 rounded-t-sm"></div>
               <div className="w-8 h-2/3 bg-blue-400 rounded-t-sm"></div>
               <div className="w-8 h-1/2 bg-blue-500 rounded-t-sm"></div>
               <div className="w-8 h-full bg-blue-600 rounded-t-sm"></div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-4 uppercase tracking-widest">Data Visualization Placeholder</p>
          </div>
        )}

        {/* Content Body */}
        <article 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: data.body || '<p class="text-gray-400 italic">Empty body content...</p>' }}
        />
      </main>
    </div>
  );
}
