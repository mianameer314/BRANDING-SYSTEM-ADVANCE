import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ValidationWarningsProps {
  data: any;
  contentType: string;
}

export function ValidationWarnings({ data, contentType }: ValidationWarningsProps) {
  const warnings: string[] = [];

  // General warnings
  if (!data.slug) warnings.push('Missing URL Slug');
  
  if (contentType === 'blog') {
    if (!data.title) warnings.push('Missing Title');
    if (!data.excerpt) warnings.push('Missing Excerpt');
    if (!data.content && !data.body) warnings.push('Missing Content');
    if (!data.cover_image) warnings.push('Missing Cover Image');
  } else if (contentType === 'news') {
    if (!data.headline) warnings.push('Missing Headline');
    if (!data.summary) warnings.push('Missing Summary');
  } else if (contentType === 'project') {
    if (!data.name) warnings.push('Missing Project Name');
    if (!data.description) warnings.push('Missing Description');
    if (!data.cover_image) warnings.push('Missing Cover Image');
  } else if (contentType === 'insight') {
    if (!data.title) warnings.push('Missing Title');
    if (!data.content) warnings.push('Missing Content');
    if (!data.cover_image) warnings.push('Missing Cover Image');
  } else if (contentType === 'case_study') {
    if (!data.title) warnings.push('Missing Title');
    if (!data.client_name) warnings.push('Missing Client Name');
    if (!data.challenge) warnings.push('Missing Challenge Section');
    if (!data.solution) warnings.push('Missing Solution Section');
    if (!data.results) warnings.push('Missing Results Section');
    if (!data.cover_image) warnings.push('Missing Cover Image');
  }

  if (warnings.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
        <AlertTriangle className="w-5 h-5" />
        Pre-Publish Validation Warnings
      </div>
      <div className="text-sm text-amber-700/90 mb-3">
        The following fields must be completed before this content can be approved or published.
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {warnings.map((warning, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700/80">
            <AlertCircle className="w-3.5 h-3.5" />
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}
