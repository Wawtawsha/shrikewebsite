"use client";

import { services } from "@/lib/services";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ServiceSelectorProps {
  onSelect: (serviceId: string) => void;
  selectedId: string | null;
}

export function ServiceSelector({ onSelect, selectedId }: ServiceSelectorProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(2rem)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {services.map((service) => {
        const isSelected = selectedId === service.id;
        const hasSomeSelected = selectedId !== null;

        return (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`text-left bg-surface border rounded-lg p-8 transition-all duration-300 cursor-pointer ${
              isSelected
                ? "border-accent shadow-[0_0_20px_oklch(0.75_0.15_80/0.15)]"
                : hasSomeSelected
                  ? "border-border-subtle opacity-60 hover:opacity-80"
                  : "border-border hover:border-accent"
            }`}
          >
            <h3
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {service.title}
            </h3>
            <p className="text-muted mb-6 text-sm leading-relaxed">
              {service.description}
            </p>
            {service.features && (
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 text-xs">&#9670;</span>
                    <span className="text-sm text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            <span className="text-accent text-sm font-medium">
              Book a consultation &rarr;
            </span>
          </button>
        );
      })}
    </div>
  );
}
