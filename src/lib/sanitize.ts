import DOMPurify from 'dompurify';

/**
 * Sanitize user-generated HTML content to prevent XSS attacks.
 * Allows basic formatting tags only.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h3', 'blockquote', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize rich course content (allows inline media: images, video, YouTube iframes).
 */
export function sanitizeCourseHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b','i','u','em','strong','a','p','br','ul','ol','li',
      'h1','h2','h3','h4','h5','h6','blockquote','span','div',
      'img','iframe','video','source','figure','figcaption','hr','code','pre',
    ],
    ALLOWED_ATTR: [
      'href','target','rel','class','style','src','alt','title',
      'controls','allowfullscreen','allow','frameborder','width','height','loading','referrerpolicy',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen','frameborder','allow'],
  });
}

/**
 * Strip all HTML tags, returning plain text only.
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
