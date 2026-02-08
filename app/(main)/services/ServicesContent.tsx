"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const services = [
  {
    id: "photography",
    title: "Photography",
    description: "Stunning visuals that capture your brand's essence.",
    href: "/services/photography",
    overlay: "bg-amber-900/60",
    badge: "bg-amber-600/80",
    icon: (
      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    id: "videography",
    title: "Videography",
    description: "Cinematic storytelling that captivates your audience.",
    href: "/services/videography",
    overlay: "bg-blue-900/60",
    badge: "bg-blue-600/80",
    icon: (
      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    id: "technical",
    title: "Technical Consultation",
    description: "Expert guidance on software and creative technology.",
    href: "/services/technical",
    overlay: "bg-emerald-900/60",
    badge: "bg-emerald-600/80",
    icon: (
      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    id: "custom",
    title: "Custom Package",
    description: "Tailored solutions for your unique project needs.",
    href: "/services/custom",
    overlay: "bg-purple-900/60",
    badge: "bg-purple-600/80",
    icon: (
      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal();
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <motion.div
        whileHover={reducedMotion ? {} : { scale: 1.02, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Link
          href={service.href}
          className="group block w-full text-left rounded-lg overflow-hidden bg-surface border border-border focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 hover:shadow-2xl transition-shadow duration-300"
        >
          {/* Thumbnail area */}
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-surface to-border flex items-center justify-center">
            {/* Icon */}
            <div className="text-white/20 transition-all duration-300 group-hover:text-white/40 group-hover:scale-110">
              {service.icon}
            </div>

            {/* Always visible label */}
            <div className="absolute inset-0 flex items-end p-6 z-10">
              <div>
                <p className="text-white font-bold text-2xl leading-tight">{service.title}</p>
                <p className="text-white/60 text-sm mt-1">{service.description}</p>
              </div>
            </div>

            {/* Hover overlay */}
            <div
              className={`absolute inset-0 ${service.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20`}
            />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export function ServicesContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {services.map((service, index) => (
        <ServiceCard key={service.id} service={service} index={index} />
      ))}
    </div>
  );
}
