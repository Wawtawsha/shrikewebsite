import { Inter, Geist, Source_Code_Pro, Syne, Cormorant_Garamond, Playfair_Display } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  variable: '--font-mono',
});

export const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'],
  variable: '--font-syne',
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
});
