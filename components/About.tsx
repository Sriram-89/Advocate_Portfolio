'use client';

import { CheckCircle, MapPin, Languages, GraduationCap } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate } from '@/config/advocate';

export default function About() {
  const { t } = useLang();

  const practiceAreas = advocate.practiceAreaKeys.map(
    (key) => t.practiceAreas[key as keyof typeof t.practiceAreas]
  );

  return (
    <section id="about" className="section-padding bg-white dark:bg-charcoal-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.about.eyebrow}</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal dark:text-white font-semibold">
            {t.about.title} {advocate.displayName}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left: Bio & Qualifications */}
          <div>
            <p className="text-slate dark:text-gray-300 leading-relaxed mb-6">
              {advocate.displayName} {t.about.bio1}
            </p>
            <p className="text-slate dark:text-gray-300 leading-relaxed mb-8">
              {t.about.bio2}
            </p>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-gold" />
                <h3 className="font-display text-lg text-charcoal dark:text-white font-semibold">
                  {t.about.qualificationsTitle}
                </h3>
              </div>
              <div className="space-y-2 pl-6 border-l border-gold/30">
                {advocate.qualifications.map((q) => (
                  <p key={q} className="text-sm text-slate dark:text-gray-300">{q}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-parchment dark:bg-charcoal-mid p-4 border-l-2 border-gold">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t.about.yearsLabel}</div>
                <div className="font-display text-charcoal dark:text-white font-semibold">{advocate.yearsOfPractice} Years</div>
              </div>
              <div className="bg-parchment dark:bg-charcoal-mid p-4 border-l-2 border-gold">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t.about.courtLabel}</div>
                <div className="font-display text-charcoal dark:text-white font-semibold">{t.about.courtValue}</div>
              </div>
              <div className="bg-parchment dark:bg-charcoal-mid p-4 border-l-2 border-gold col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Languages size={14} className="text-gold" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.about.languagesLabel}</div>
                </div>
                <div className="font-display text-charcoal dark:text-white font-semibold">{advocate.languagesSpoken}</div>
              </div>
              <div className="bg-parchment dark:bg-charcoal-mid p-4 border-l-2 border-gold col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-gold" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.about.officeLabel}</div>
                </div>
                <div className="font-display text-charcoal dark:text-white font-semibold">{advocate.officeAddress.full}</div>
              </div>
            </div>
          </div>

          {/* Right: Practice Areas + Achievements */}
          <div>
            <div className="mb-10">
              <h3 className="font-display text-lg text-charcoal dark:text-white font-semibold mb-5">
                {t.about.practiceTitle}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {practiceAreas.map((area) => (
                  <div key={area} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate dark:text-gray-300">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
