"use client";

import { InlineWidget } from "react-calendly";

interface CalendlyEmbedProps {
  selectedService?: string;
}

export function CalendlyEmbed({ selectedService }: CalendlyEmbedProps) {
  return (
    <div>
      <h2
        className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Schedule Your Consultation
      </h2>
      {selectedService && (
        <p className="text-muted mb-8">
          Booking for:{" "}
          <span className="text-accent font-medium capitalize">
            {selectedService.replace("-", " ")}
          </span>
        </p>
      )}
      {!selectedService && (
        <p className="text-muted mb-8">
          Select a service above, or book a general consultation.
        </p>
      )}
      <div className="rounded-lg overflow-hidden border border-border">
        <InlineWidget
          url="https://calendly.com/shrike-media/consultation"
          styles={{ minWidth: "320px", height: "700px" }}
          pageSettings={{
            backgroundColor: "0a0a0a",
            textColor: "ffffff",
            primaryColor: "c49a3c",
          }}
          prefill={{}}
          utm={{
            utmContent: selectedService || undefined,
          }}
        />
      </div>
    </div>
  );
}
