'use client';

import { Quote } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function Testimonials() {
  const { t } = useLang();

  return (
    <section className="section-padding bg-white dark:bg-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.testimonials.eyebrow}</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal dark:text-white font-semibold">
            {t.testimonials.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.testimonials.items.map(({ quote, name, case: caseType }) => (
            <div
              key={name}
              className="card-hover bg-parchment dark:bg-charcoal-mid p-8 border border-gray-100 dark:border-gray-800 relative"
            >
              <Quote size={32} className="text-gold/20 absolute top-6 right-6" />
              <div className="h-px w-8 bg-gold mb-6" />
              <p className="text-slate dark:text-gray-300 text-sm leading-relaxed mb-8 italic">
                "{quote}"
              </p>
              <div>
                <p className="text-charcoal dark:text-white font-semibold text-sm">{name}</p>
                <p className="text-gold text-xs mt-1">{caseType}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-xs text-gray-400 italic">{t.testimonials.note}</p>
        </div>
      </div>
    </section>
  );
}
