/**
 * ManoProtect - Landing Page
 * Clean, professional, conversion-focused homepage
 * Redesigned for better user experience and lower cognitive load
 * SEO Optimized: digital security, fraud prevention, online payment protection
 */
import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';

// Components
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import SOSProductShowcase from '@/components/landing/SOSProductShowcase';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';

// Lazy load non-critical components
const AIChatWidget = lazy(() => import('@/components/AIChatWidget'));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>ManoProtect - Digital Security & Fraud Prevention | Online Payment Protection España</title>
        <meta name="description" content="ManoProtect ofrece digital security líder en España. Fraud prevention con IA, online payment protection y alertas SOS con GPS. Protege a tu familia. 7 días GRATIS." />
        <meta name="keywords" content="digital security, fraud prevention, online payment protection, secure online payments, protección digital, seguridad online, antifraude, estafas digitales, phishing, SOS emergencias, GPS familiar, ciberseguridad España" />
        <link rel="canonical" href="https://manoprotect.com" />
      </Helmet>

      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section - Digital Security */}
        <HeroSection />

        {/* Features Grid - Fraud Prevention & Online Payment Protection */}
        <FeaturesGrid />

        {/* SOS Product Showcase - Secure Online Payments */}
        <SOSProductShowcase />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Final CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Deferred components */}
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default LandingPage;
