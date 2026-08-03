import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Composable for converting markdown text into sanitized HTML.
 */
export function useMarkdown() {
  const renderMarkdown = (content: string | null | undefined): string => {
    if (!content || typeof content !== 'string') return '';
    try {
      // Configure marked options
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      
      const rawHtml = marked.parse(content) as string;
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel'],
      });
    } catch (e) {
      console.error('[useMarkdown] Error parsing markdown:', e);
      return content.replace(/\n/g, '<br>');
    }
  };

  return {
    renderMarkdown,
  };
}
