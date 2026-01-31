export interface Project {
  slug: string;
  title: string;
  description: string;
  category: 'photography' | 'videography' | 'technical';
  thumbnail: string;
  heroImage?: string;
  images?: string[];
  videos?: string[];
  client?: string;
  date?: string;
  tags?: string[];
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
}
