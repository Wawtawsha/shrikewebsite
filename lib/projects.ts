import type { Project } from "@/types/portfolio";

export const projects: Project[] = [
  {
    slug: "urban-portraits",
    title: "Urban Portraits",
    description: "Raw, cinematic portraiture shot in downtown environments with natural light and shadow play.",
    category: "photography",
    thumbnail: "/images/portfolio/photo-1.jpg",
    client: "Independent",
    date: "2025-11",
    tags: ["portrait", "urban", "natural-light"],
    featured: true,
  },
  {
    slug: "product-launch-campaign",
    title: "Product Launch Campaign",
    description: "Full product photography suite for a luxury tech brand launch, including lifestyle and studio shots.",
    category: "photography",
    thumbnail: "/images/portfolio/photo-2.jpg",
    client: "Apex Devices",
    date: "2025-09",
    tags: ["product", "studio", "commercial"],
    featured: false,
  },
  {
    slug: "architectural-series",
    title: "Architectural Series",
    description: "Minimalist architectural photography exploring geometric forms in modern buildings.",
    category: "photography",
    thumbnail: "/images/portfolio/photo-3.jpg",
    client: "Metro Design Co",
    date: "2025-07",
    tags: ["architecture", "minimalist", "geometric"],
    featured: false,
  },
  {
    slug: "brand-showreel",
    title: "Brand Showreel",
    description: "A 60-second cinematic showreel capturing the energy and vision of a fitness brand.",
    category: "videography",
    thumbnail: "/images/portfolio/video-1.jpg",
    client: "Forge Athletics",
    date: "2025-10",
    tags: ["showreel", "branding", "cinematic"],
    featured: true,
  },
  {
    slug: "event-highlight-reel",
    title: "Event Highlight Reel",
    description: "Multi-camera event coverage distilled into a dynamic two-minute highlight film.",
    category: "videography",
    thumbnail: "/images/portfolio/video-2.jpg",
    client: "Summit Conference",
    date: "2025-08",
    tags: ["event", "multi-cam", "highlight"],
    featured: false,
  },
  {
    slug: "documentary-short",
    title: "Documentary Short",
    description: "A five-minute documentary following a local craftsman, blending interview and b-roll.",
    category: "videography",
    thumbnail: "/images/portfolio/video-3.jpg",
    client: "Heartland Stories",
    date: "2025-06",
    tags: ["documentary", "storytelling", "interview"],
    featured: true,
  },
  {
    slug: "data-pipeline-dashboard",
    title: "Data Pipeline Dashboard",
    description: "Real-time monitoring dashboard for Microsoft Fabric data pipelines with alert integration.",
    category: "technical",
    thumbnail: "/images/portfolio/tech-1.jpg",
    client: "Enterprise Client",
    date: "2025-12",
    tags: ["dashboard", "data-engineering", "fabric"],
    featured: false,
  },
  {
    slug: "automation-toolkit",
    title: "Automation Toolkit",
    description: "Custom CI/CD and deployment automation reducing release cycles from days to hours.",
    category: "technical",
    thumbnail: "/images/portfolio/tech-2.jpg",
    client: "DevOps Corp",
    date: "2025-05",
    tags: ["automation", "devops", "ci-cd"],
    featured: false,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByCategory(category: Project["category"]): Project[] {
  return projects.filter((p) => p.category === category);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
