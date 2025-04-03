import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      html: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      body: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      header: React.HTMLProps<HTMLElement>;
      footer: React.HTMLProps<HTMLElement>;
      button: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    }
  }
}

declare module 'framer-motion' {
  export const motion: {
    [key: string]: React.ComponentType<any>;
  };
  export const AnimatePresence: React.ComponentType<{
    children: ReactNode;
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module 'lucide-react' {
  export interface LucideIcon extends React.FC<React.SVGProps<SVGSVGElement>> {
    displayName?: string;
  }
}

export {};
