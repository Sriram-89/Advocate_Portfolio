'use client';

import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate, whatsappUrl } from '@/config/advocate';

export default function Contact() {
  const { t } = useLang();

  const contactDetails = [
    {
      icon: Phone,
      title: t.contact.phoneTitle,
      lines: advocate.phones,
      href: `tel:+${advocate.primaryPhone}`,
      linkLabel: t.contact.callNow,
    },
    {
      icon: Mail,
      title: t.contact.emailTitle,
      lines: advocate.emails,
      href: `mailto:${advocate.primaryEmail}`,
      linkLabel: t.contact.sendEmail,
    },
    {
      icon: MapPin,
      title: t.contact.addressTitle,
      lines: [advocate.officeAddress.line1, advocate.officeAddress.line2],
      href: `https://maps.google.com/?q=${advocate.officeAddress.mapQuery}`,
      linkLabel: t.contact.viewMap,
    },
    {
      icon: Clock,
      title: t.contact.hoursTitle,
      lines: [advocate.workingHours.weekdays, advocate.workingHours.saturday],
      href: null,
      linkLabel: null,
    },
  ];

  return (
    <section id="contact" className="section-padding bg-parchment dark:bg-charcoal-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.contact.eyebrow}</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal dark:text-white font-semibold">
            {t.contact.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          <div className="grid sm:grid-cols-2 gap-5">
            {contactDetails.map(({ icon: Icon, title, lines, href, linkLabel }) => (
              <div key={title} className="bg-white dark:bg-charcoal-mid p-6 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 border border-gold/40 flex items-center justify-center">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <h3 className="text-xs tracking-widest uppercase text-slate dark:text-gray-400 font-medium">{title}</h3>
                </div>
                <div className="space-y-1 mb-4">
                  {lines.map((line) => (
                    <p key={line} className="text-sm text-charcoal dark:text-white font-medium leading-relaxed">{line}</p>
                  ))}
                </div>
                {href && linkLabel && (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors"
                  >
                    {linkLabel} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ))}

            {/* WhatsApp card */}
            <div className="sm:col-span-2 bg-charcoal dark:bg-charcoal-mid p-6 border border-gold/20 flex items-center gap-5">
              <div className="w-12 h-12 bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#D4AF37">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold mb-1">{t.contact.whatsappTitle}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t.contact.whatsappDesc}</p>
              </div>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-gold text-xs flex-shrink-0">
                {t.contact.chatNow}
              </a>
            </div>
          </div>

          {/* Google Maps */}
          <div className="h-[420px] relative border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <iframe
              src={advocate.officeAddress.mapsEmbed}
              width="100%" height="100%"
              style={{ border: 0, filter: 'grayscale(30%)' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            />
            <div className="absolute bottom-4 left-4 bg-white dark:bg-charcoal-mid shadow-lg px-4 py-3 border-l-2 border-gold">
              <p className="text-xs text-gold uppercase tracking-wider font-medium">Chamber</p>
              <p className="text-charcoal dark:text-white text-sm font-semibold">{advocate.enrolledCourt} Complex</p>
              <p className="text-gray-500 text-xs">{advocate.officeAddress.line2}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
