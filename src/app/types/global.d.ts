import { LucideIcon } from 'lucide-react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      button: DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      span: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      input: DetailedHTMLProps<HTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      textarea: DetailedHTMLProps<HTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      select: DetailedHTMLProps<HTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      option: DetailedHTMLProps<HTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    }
  }
}

declare module 'lucide-react' {
  interface LucideIcon {
    displayName?: string;
  }
}
