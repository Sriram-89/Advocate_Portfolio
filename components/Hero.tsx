'use client';

import { Phone, Calendar, Award, Briefcase, Users } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate } from '@/config/advocate';
import Image from 'next/image';

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="min-h-screen bg-charcoal relative overflow-hidden flex items-center" id="home">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gold opacity-30" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Content */}
          <div className="order-2 lg:order-1 animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-widest uppercase font-medium">
                {t.hero.enrolledTag}
              </span>
            </div>

            <h1 className="font-display text-white mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}>
              {advocate.displayName.split(' ').slice(0, 2).join(' ')}<br />
              <span className="text-gold">{advocate.displayName.split(' ').slice(2).join(' ')}</span>
            </h1>

            <p className="text-gray-400 text-sm tracking-widest uppercase mb-6 font-medium">
              {t.hero.tagline}
            </p>

            <p className="text-gray-300 leading-relaxed mb-10 max-w-lg" style={{ fontSize: '1.05rem' }}>
              {t.hero.bio}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 border-t border-b border-gray-700 py-8">
              {[
                { icon: Award, value: advocate.yearsOfPractice, label: t.hero.yearsLabel },
                { icon: Briefcase, value: advocate.casesHandled, label: t.hero.casesLabel },
                { icon: Users, value: advocate.clientSatisfaction, label: t.hero.satisfactionLabel },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className="text-gold mx-auto mb-2 opacity-80" />
                  <div className="font-display text-white text-2xl font-semibold">{value}</div>
                  <div className="text-gray-500 text-xs mt-1 leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#appointment" className="btn-gold text-center">
                <span className="flex items-center justify-center gap-2">
                  <Calendar size={15} />
                  {t.hero.bookBtn}
                </span>
              </a>
              <a href={`tel:+${advocate.primaryPhone}`} className="btn-outline text-center">
                <span className="flex items-center justify-center gap-2">
                  <Phone size={15} />
                  {t.hero.callBtn}
                </span>
              </a>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 border border-gold opacity-20" />
              <div className="absolute -inset-2 border border-gold opacity-10" />

              <div className="relative w-72 h-96 lg:w-80 lg:h-[440px] overflow-hidden" style={{ filter: 'grayscale(20%)' }}>
                {advocate.photoUrl ? (
                  <Image
                    src={advocate.photoUrl}
                    alt={advocate.displayName}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gray-600 border-2 border-gold mb-4 flex items-center justify-center">
                      <span className="font-display text-4xl text-gold font-bold">{advocate.photoInitial}</span>
                    </div>
                    <p className="text-gray-400 text-xs text-center px-4">Replace with advocate photo<br />in config/advocate.ts</p>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 bg-gold px-3 py-2 shadow-xl max-w-full">
                <div className="text-charcoal text-xs font-semibold tracking-wider uppercase">{advocate.barCouncil}</div>
                <div className="text-charcoal text-xs opacity-70">Reg. No. {advocate.enrollmentNumber}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-charcoal to-transparent" />
    </section>
  );
}
