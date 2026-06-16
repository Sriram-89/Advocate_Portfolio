'use client';

import { Scale } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate, whatsappUrl } from '@/config/advocate';

function FacebookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
}
function InstagramIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function TwitterIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}

export default function Footer() {
  const { t } = useLang();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { url: advocate.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
    { url: advocate.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { url: advocate.social.twitter, Icon: TwitterIcon, label: 'X / Twitter' },
  ].filter((s) => s.url !== null);

  const navLinks = [
    { href: '#home', label: t.footer.navLinks.home },
    { href: '#about', label: t.footer.navLinks.about },
    { href: '#services', label: t.footer.navLinks.services },
    { href: '#ai-assistant', label: t.footer.navLinks.ai },
    { href: '#appointment', label: t.footer.navLinks.appointment },
    { href: '#contact', label: t.footer.navLinks.contact },
  ];

  const practiceAreas = advocate.practiceAreaKeys
    .slice(0, 8)
    .map((key) => t.practiceAreas[key as keyof typeof t.practiceAreas]);

  return (
    <footer className="bg-charcoal border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand + Social */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 border border-gold flex items-center justify-center">
                <Scale size={18} className="text-gold" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">{advocate.displayName.toUpperCase()}</div>
                <div className="text-xs tracking-widest text-gold font-medium" style={{ fontSize: '0.6rem' }}>{advocate.title.toUpperCase()}</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">{t.footer.description}</p>

            <div className="space-y-2 mb-6">
              <a href={`tel:+${advocate.primaryPhone}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors">
                <span className="text-gold text-xs">☎</span> {advocate.phones[0]}
              </a>
              <a href={`mailto:${advocate.primaryEmail}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors">
                <span className="text-gold text-xs">✉</span> {advocate.primaryEmail}
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <span className="text-gold text-xs mt-0.5">⊙</span>
                <span>{advocate.officeAddress.full}</span>
              </div>
            </div>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-xs text-gold uppercase tracking-widest font-medium mb-3">{t.footer.followUs}</p>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ url, Icon, label }) => (
                    <a
                      key={label}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 border border-gray-700 flex items-center justify-center text-gray-500 hover:text-gold hover:border-gold transition-all duration-200"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs text-gold uppercase tracking-widest font-medium mb-5">{t.footer.navigationTitle}</h3>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-gray-500 hover:text-gold transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Areas */}
          <div>
            <h3 className="text-xs text-gold uppercase tracking-widest font-medium mb-5">{t.footer.practiceTitle}</h3>
            <ul className="space-y-3">
              {practiceAreas.map((area) => (
                <li key={area}>
                  <a href="#services" className="text-sm text-gray-500 hover:text-gold transition-colors">{area}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-charcoal-mid border border-gold/10 p-5 mb-8">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">{t.footer.disclaimerLabel}:</strong>{' '}{t.footer.disclaimer}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {currentYear} {advocate.copyrightName}. {t.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: t.footer.privacyPolicy, href: '#' },
                { label: t.footer.termsConditions, href: '#' },
                { label: t.footer.disclaimerLink, href: '#' },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="text-xs text-gray-600 hover:text-gold transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
