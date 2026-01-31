import type { Service } from "@/types/portfolio";

export const services: Service[] = [
  {
    id: "photography",
    title: "Photography",
    description:
      "From editorial portraits to commercial product shoots, we craft images that command attention. Every frame is lit, composed, and edited to cinematic standards.",
    features: [
      "Portrait and editorial photography",
      "Product and commercial shoots",
      "Architectural and real estate imagery",
      "Post-production and retouching",
    ],
  },
  {
    id: "videography",
    title: "Videography",
    description:
      "Cinematic video production from concept through final cut. We handle showreels, brand films, event coverage, and documentary work with broadcast-quality results.",
    features: [
      "Brand films and showreels",
      "Event and conference coverage",
      "Documentary and narrative shorts",
      "Color grading and post-production",
    ],
  },
  {
    id: "technical-consultation",
    title: "Technical Consultation",
    description:
      "Data engineering, pipeline architecture, and automation consulting for teams that need creative problem-solving applied to technical challenges.",
    features: [
      "Data pipeline design and optimization",
      "CI/CD and deployment automation",
      "Cloud architecture consulting",
      "Performance auditing and monitoring",
    ],
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
