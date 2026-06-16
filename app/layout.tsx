import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adv. Rambabu Chintaparthi — Criminal & Civil Lawyer | AP High Court',
  description: 'Senior Advocate with 25+ years of experience in Criminal, Civil, Property, Family, and Cyber Law. Practicing at AP High Court & District Courts. Book a consultation today.',
  keywords: 'Advocate AP, criminal lawyer India, civil advocate, property dispute lawyer, family law attorney, cyber crime lawyer, legal consultation',
  openGraph: {
    title: 'Adv. Rambabu Chintaparthi — Senior Advocate',
    description: 'Expert legal consultation for Criminal, Civil, Property, Family & Cyber Law matters.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var stored = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (stored === 'dark' || (!stored && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            })();
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
