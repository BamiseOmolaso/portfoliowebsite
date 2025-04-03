declare module 'html-to-text' {
  interface HtmlToTextOptions {
    wordwrap?: number | boolean;
    selectors?: Array<{
      selector: string;
      format?: string;
      options?: Record<string, any>;
    }>;
  }

  export function convert(html: string, options?: HtmlToTextOptions): string;
} 