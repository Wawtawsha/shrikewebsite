export interface PromoOffer {
  title: string;
  description: string;
}

export interface PromoConfig {
  bannerText: string;
  offers: PromoOffer[];
  delayMs?: number; // default 15000
}

export interface EventConfig {
  /** Slug used to look up the event in Supabase */
  supabaseSlug: string;
  /** Theme variant — controls colors, divider style, and unlock form */
  theme: "default" | "blacklight";
  /** Tracking label (defaults to URL slug if omitted) */
  websiteLabel?: string;
  /** Optional promo popup config */
  promo?: PromoConfig;
}

/**
 * Event gallery configs keyed by URL slug.
 * The key becomes the route: /events/{key}
 */
export const eventConfigs: Record<string, EventConfig> = {
  pressclub: {
    supabaseSlug: "2016-night-at-press-club",
    theme: "default",
    websiteLabel: "press-club",
    promo: {
      bannerText: "SPECIAL OFFER — Limited Time Deals",
      offers: [
        {
          title: "Instagram Carousels",
          description:
            "Book a custom Instagram Carousel shoot — we handle the photography, editing, and delivery at a discounted rate.",
        },
        {
          title: "Sorority & Fraternity Formals",
          description:
            "Now booking photography for Sorority and Fraternity Formals. Contact us to lock in your date.",
        },
      ],
    },
  },
  "theta-chi": {
    supabaseSlug: "theta-chi-house-party",
    theme: "blacklight",
    websiteLabel: "theta-chi-house-party",
  },
  SAE: {
    supabaseSlug: "sae-house-party",
    theme: "blacklight",
    websiteLabel: "sae-house-party",
  },
  collegethursday: {
    supabaseSlug: "college-thursday",
    theme: "default",
    websiteLabel: "college-thursday",
  },
};
