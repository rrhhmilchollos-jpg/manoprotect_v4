/**
 * ManoProtect - New Landing Page
 * Clean, professional, conversion-focused homepage
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
        <title>ManoProtect - Protección Digital para tu Familia | Anti-Estafas España</title>
        <meta name="description" content="Protege a tu familia contra estafas online, fraudes telefónicos y amenazas digitales. Detección de estafas en tiempo real. 7 días GRATIS." />
        <meta name="keywords" content="protección digital, anti estafas, seguridad online, protección familiar, fraudes online, ciberseguridad, España" />
        <link rel="canonical" href="https://manoprotect.com" />
      </Helmet>

      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* SOS Product Showcase */}
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
