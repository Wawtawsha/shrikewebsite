"use client";

import { useCallback, useRef, useState } from "react";
import { ServiceSelector } from "@/components/ServiceSelector";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";

export function ServicesContent() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((serviceId: string) => {
    setSelectedService(serviceId);
    // Smooth scroll to Calendly after state updates
    setTimeout(() => {
      calendlyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  return (
    <>
      {/* SERV-02: Service selector */}
      <section className="mb-24">
        <ServiceSelector onSelect={handleSelect} selectedId={selectedService} />
      </section>

      {/* SERV-03: Calendly booking */}
      <section ref={calendlyRef} className="mb-16 scroll-mt-24">
        <CalendlyEmbed selectedService={selectedService ?? undefined} />
      </section>

      {/* SERV-04: Contact CTA */}
      <section className="text-center py-12 border-t border-border">
        <p className="text-muted text-lg">
          Every project is unique.{" "}
          <span className="text-foreground font-medium">
            Contact us for custom pricing
          </span>{" "}
          tailored to your specific needs.
        </p>
      </section>
    </>
  );
}
