import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['br', 'p', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeEmail(email: string): string {
  // Remove any newlines or carriage returns
  return email.replace(/[\r\n]/g, '');
}

export function sanitizeSubject(subject: string): string {
  // Remove any newlines or carriage returns
  return subject.replace(/[\r\n]/g, '');
}

export function sanitizeText(text: string): string {
  // Basic sanitization for plain text
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
} 