import { format } from 'date-fns';

export function NewsPreview({ data }: { data: any }) {
  return (
    <div className="font-serif antialiased text-[#111] pb-24 bg-[#faf9f6] min-h-full">
      {/* Header / Nav simulation */}
      <header className="h-24 flex items-center justify-center border-b border-gray-300/60">
        <div className="font-sans font-black text-3xl tracking-tighter uppercase">Newsroom</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-16 text-center">
        {/* FOR IMMEDIATE RELEASE flag */}
        <div className="text-xs font-sans font-bold tracking-[0.2em] text-red-700 mb-8 uppercase">
          For Immediate Release
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
          {data.title || 'Untitled Press Release'}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-700 leading-relaxed mb-12 italic">
          {data.excerpt || 'No summary provided.'}
        </p>

        {/* Dateline */}
        <div className="text-left font-sans text-sm font-semibold tracking-wide text-gray-500 mb-8 border-b pb-4">
          <span className="uppercase text-black">New York, NY</span> — {' '}
          {data.published_at ? format(new Date(data.published_at), 'MMMM d, yyyy') : 'Draft Date'}
        </div>

        {/* Cover Image */}
        {data.cover_image && (
          <div className="w-full mb-12">
            <img src={data.cover_image} alt={data.title} className="w-full h-auto" />
            <p className="text-left font-sans text-xs text-gray-500 mt-2">Media Asset 1</p>
          </div>
        )}

        {/* Content Body */}
        <article 
          className="prose prose-lg text-left max-w-none prose-p:leading-loose prose-p:text-gray-800"
          dangerouslySetInnerHTML={{ __html: data.body || '<p class="text-gray-400 italic">Empty body content...</p>' }}
        />

        {/* PR Footer */}
        <div className="mt-20 pt-8 border-t border-gray-300 text-left font-sans">
          <h4 className="font-bold text-lg mb-2">About O2Geeks</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            O2Geeks is a leading technology agency specializing in branding, engineering, and digital transformation. 
            For media inquiries, please contact press@o2geeks.com.
          </p>
        </div>
      </main>
    </div>
  );
}
