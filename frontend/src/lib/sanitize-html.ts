export function sanitizeEmailHtml(rawHtml?: string | null, rawText?: string | null): string {
  if (typeof window === 'undefined') {
    // Fallback for SSR environment (though typically not reached in this flow)
    return rawHtml ?? `<pre style="font-family: system-ui, sans-serif; padding: 1rem; margin: 0; white-space: pre-wrap;">${rawText ?? '<i>(no body)</i>'}</pre>`;
  }

  // If no HTML is provided, wrap the plain text in a basic HTML structure
  if (!rawHtml) {
    const textHtml = `<pre style="font-family: system-ui, sans-serif; padding: 1rem; margin: 0; white-space: pre-wrap;">${rawText ?? '<i>(no body)</i>'}</pre>`;
    rawHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${textHtml}</body></html>`;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // 1. Ensure mobile viewport meta tag exists
  let viewportMeta = doc.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = doc.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    if (doc.head) {
      doc.head.appendChild(viewportMeta);
    }
  }

  // 2. Secure all anchor tags
  const links = doc.querySelectorAll('a');
  links.forEach(link => {
    // Prevent XSS via javascript: URLs
    const href = link.getAttribute('href') || '';
    if (href.trim().toLowerCase().startsWith('javascript:')) {
      link.setAttribute('href', '#');
    }
    
    // Force open in new tab securely
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return doc.documentElement.outerHTML;
}
