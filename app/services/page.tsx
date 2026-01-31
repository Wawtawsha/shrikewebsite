const services = [
  {
    id: 'photography',
    title: 'Photography',
    description: 'Premium commercial and editorial photography that captures your brand\'s essence with technical precision and artistic vision.',
    features: [
      'Commercial product photography',
      'Editorial and portrait sessions',
      'Architectural and interior photography',
      'High-resolution digital delivery',
    ],
  },
  {
    id: 'videography',
    title: 'Videography',
    description: 'Cinematic video production from concept to final edit, delivering compelling visual stories that engage and inspire.',
    features: [
      'Brand films and commercials',
      'Event coverage and documentation',
      'Promotional video content',
      '4K production with color grading',
    ],
  },
  {
    id: 'technical',
    title: 'Technical Consultation',
    description: 'Expert guidance on creative technology, workflow optimization, and technical solutions for complex media challenges.',
    features: [
      'Creative pipeline design',
      'Asset management systems',
      'Workflow automation',
      'Technical problem solving',
    ],
  },
];

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-geist)' }}>
          Services
        </h1>
        <p className="text-xl text-muted mb-16 max-w-2xl">
          Elite creative engineering across photography, videography, and technical consultation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-surface border border-border rounded-lg p-8 hover:border-accent transition-colors"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
                {service.title}
              </h2>
              <p className="text-muted mb-6">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1.5">•</span>
                    <span className="text-sm text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
