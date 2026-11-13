import React, { useEffect, useState } from 'react';
import TestimonialsView, { type TestimonialViewItem } from './TestimonialsView';

/**
 * Ładuje opinie z CMS i pokazuje sekcję. Cały moduł (razem z klientem Sanity) jest chunkiem
 * lazy ładowanym tylko przy włączonym przełączniku (patrz TestimonialsSlot.tsx).
 * 0 opinii albo błąd pobrania = brak sekcji.
 */
const Testimonials: React.FC = () => {
  const [items, setItems] = useState<TestimonialViewItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import('@/services/cmsService'), import('@/services/cms/client')])
      .then(async ([{ cmsService }, { urlFor }]) => {
        const data = await cmsService.getTestimonials();
        if (cancelled) return;
        setItems(
          data.map((t) => ({
            id: t._id,
            companyName: t.companyName,
            industry: t.industry,
            personFirstName: t.personFirstName,
            quote: t.quote,
            logoUrl: t.logo ? urlFor(t.logo).width(112).height(112).url() : undefined,
            googleReviewUrl: t.googleReviewUrl,
          })),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return <TestimonialsView items={items} />;
};

export default Testimonials;
