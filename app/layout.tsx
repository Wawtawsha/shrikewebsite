import type { Metadata } from "next";
import { inter, geist, sourceCodePro, syne, cormorantGaramond, playfairDisplay } from "@/lib/fonts";
import { siteMetadata, SITE_URL, generateOrganizationJsonLd } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteMetadata.title,
    template: "%s | Shrike Media",
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  openGraph: {
    type: siteMetadata.og.type,
    locale: siteMetadata.og.locale,
    url: SITE_URL,
    siteName: siteMetadata.og.siteName,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Shrike Media - Elite Creative Engineering",
      },
    ],
  },
  twitter: {
    card: siteMetadata.twitter.card,
    creator: siteMetadata.twitter.creator,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geist.variable} ${sourceCodePro.variable} ${syne.variable} ${cormorantGaramond.variable} ${playfairDisplay.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
