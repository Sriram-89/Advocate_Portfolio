'use client';

import {
  Shield, FileText, Building2, Heart, Scissors, AlertTriangle,
  Monitor, ShoppingBag, ClipboardList
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const serviceIcons = [
  Shield, FileText, Building2, Heart, Scissors,
  AlertTriangle, Monitor, ShoppingBag, ClipboardList,
];

const serviceKeys = [
  'criminal', 'civil', 'property', 'family', 'divorce',
  'domesticViolence', 'cyberCrime', 'consumer', 'documentation',
] as const;

export default function Services() {
  const { t } = useLang();

  return (
    <section id="services" className="section-padding bg-parchment dark:bg-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.services.eyebrow}</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal dark:text-white font-semibold mb-4">
            {t.services.title}
          </h2>
          <p className="text-slate dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceKeys.map((key, i) => {
            const Icon = serviceIcons[i];
            const item = t.services.items[key];
            return (
              <div
                key={key}
                className="card-hover bg-white dark:bg-charcoal-mid p-8 border border-gray-100 dark:border-gray-800 group cursor-pointer"
              >
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center mb-6 group-hover:border-gold transition-colors duration-300">
                  <Icon size={20} className="text-gold" />
                </div>
                <h3 className="font-display text-lg text-charcoal dark:text-white font-semibold mb-3 group-hover:text-gold transition-colors duration-300">
                  {item.title}
                </h3>
                <div className="h-px w-8 bg-gold/40 group-hover:bg-gold mb-4 transition-colors duration-300" />
                <p className="text-sm text-slate dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-slate dark:text-gray-400 mb-6">{t.services.cta}</p>
          <a href="#ai-assistant" className="btn-gold inline-block">{t.services.ctaBtn}</a>
        </div>
      </div>
    </section>
  );
}
