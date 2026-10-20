import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteHeader } from '@/components/site-header';

import { Providers } from './providers';

import './globals.css';

// `variable` expõe a fonte como variável CSS, consumida pelo tema do shadcn/ui
// em globals.css (`--font-sans` e `--font-geist-mono`).
const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Alicerce — simulador de financiamento imobiliário',
    template: '%s | Alicerce',
  },
  description:
    'Simule um financiamento imobiliário em SAC ou Price, compare os dois sistemas e ' +
    'veja a tabela de amortização completa, com CET e encargos.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
