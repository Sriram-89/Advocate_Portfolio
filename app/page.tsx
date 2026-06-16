import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import AIAssistant from '@/components/AIAssistant';
import Appointment from '@/components/Appointment';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <LanguageProvider>
      <main>
        <Navbar />
        <Hero />
        <About />
        <Services />
        <AIAssistant />
        <Testimonials />
        <Appointment />
        <Contact />
        <Footer />
        <WhatsAppFloat />
      </main>
    </LanguageProvider>
  );
}
