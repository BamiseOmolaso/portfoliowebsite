import { ReactNode } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      html: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      body: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare module 'framer-motion' {
  export const motion: {
    [key: string]: React.ComponentType<any>;
  };
} 