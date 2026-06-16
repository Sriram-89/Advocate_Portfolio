'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Scale, Globe } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate } from '@/config/advocate';
import { Lang } from '@/lib/translations';

const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'HI' },
  { code: 'te', label: 'తెలుగు', short: 'TE' },
];

// Social icon SVGs (inline, no new library)
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#ai-assistant', label: t.nav.aiGuidance },
    { href: '#appointment', label: t.nav.appointment },
    { href: '#contact', label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    setDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDark(true);
    }
  };

  const socialLinks = [
    { url: advocate.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
    { url: advocate.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { url: advocate.social.twitter, Icon: TwitterIcon, label: 'X / Twitter' },
  ].filter((s) => s.url !== null);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-charcoal/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 border border-gold flex items-center justify-center">
              <Scale size={18} className="text-gold" />
            </div>
            <div>
              <div className="font-display text-sm font-semibold tracking-wide text-charcoal dark:text-white">
                {advocate.shortName.toUpperCase()}
              </div>
              <div className="text-xs tracking-widest text-gold font-medium" style={{ fontSize: '0.6rem' }}>
                {advocate.title.toUpperCase()}
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest uppercase font-medium text-slate dark:text-gray-300 hover:text-gold dark:hover:text-gold transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Social icons — desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              {socialLinks.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center text-slate dark:text-gray-400 hover:text-gold transition-colors border border-transparent hover:border-gold/30"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 w-auto h-9 px-2 text-slate dark:text-gray-300 hover:text-gold transition-colors border border-transparent hover:border-gold/30"
                aria-label="Switch language"
              >
                <Globe size={15} />
                <span className="text-xs font-medium tracking-wider">
                  {LANGS.find((l) => l.code === lang)?.short}
                </span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-charcoal-mid border border-gray-200 dark:border-gray-700 shadow-lg min-w-[120px] z-50">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-parchment dark:hover:bg-charcoal transition-colors flex items-center justify-between ${
                        lang === l.code ? 'text-gold font-semibold' : 'text-slate dark:text-gray-300'
                      }`}
                    >
                      {l.label}
                      {lang === l.code && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 flex items-center justify-center text-slate dark:text-gray-300 hover:text-gold transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <a href="#appointment" className="hidden lg:block btn-gold text-xs">
              {t.nav.bookConsultation}
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-slate dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-charcoal border-t border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="px-6 py-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs tracking-widest uppercase font-medium text-slate dark:text-gray-300 hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#appointment"
              onClick={() => setMenuOpen(false)}
              className="btn-gold text-center mt-2"
            >
              {t.nav.bookConsultation}
            </a>
            {/* Social — mobile */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                {socialLinks.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-slate dark:text-gray-400 hover:text-gold transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
