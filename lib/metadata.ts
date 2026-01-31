import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shrikemedia.com";

export const siteMetadata = {
  title: "Shrike Media | Elite Creative Engineering",
  description:
    "Premium photography, videography, and technical consultation for brands that demand excellence. Elite creative engineering solutions.",
  author: "Shrike Media",
  keywords: [
    "photography",
    "videography",
    "creative engineering",
    "technical consultation",
    "commercial photography",
    "brand films",
    "creative solutions",
  ],
  og: {
    type: "website" as const,
    locale: "en_US",
    siteName: "Shrike Media",
  },
  twitter: {
    card: "summary_large_image" as const,
    creator: "@shrikemedia",
  },
};

export function generateJsonLd(data: {
  type: "CreativeWork";
  name: string;
  description: string;
  image?: string;
  datePublished?: string;
  author?: string;
  creator?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": data.type,
    name: data.name,
    description: data.description,
    ...(data.image && { image: data.image }),
    ...(data.datePublished && { datePublished: data.datePublished }),
    author: data.author || siteMetadata.author,
    creator: data.creator || siteMetadata.author,
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shrike Media",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: siteMetadata.description,
    sameAs: [
      // Add social media URLs when available
    ],
  };
}
