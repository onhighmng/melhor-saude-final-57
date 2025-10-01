import React, { Suspense, lazy, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { ModernHeroSection } from '@/components/ModernHeroSection';
import SobreNosSection from '@/components/SobreNosSection';
import CloudsScrollProvider from '@/components/clouds/CloudsScrollProvider';
import ScrollAnimationProvider from '@/components/guides/ScrollAnimationProvider';
import DemoFloatingButton from '@/components/DemoFloatingButton';

// Lazy load heavy below-the-fold components
const MissionVisionValuesSection = lazy(() => import('@/components/MissionVisionValuesSection'));
const InfoCardsSection = lazy(() => import('@/components/InfoCardsSection'));
const GuidesSection = lazy(() => import('@/components/GuidesSection'));
const PillarCarousel = lazy(() => import('@/components/PillarCarousel'));
const MembershipCardsSection = lazy(() => import('@/components/MembershipCardsSection'));
const FAQSection = lazy(() => import('@/components/FAQSection'));

const Index = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <CloudsScrollProvider>
      <ScrollAnimationProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <HeroSection />
          <ModernHeroSection />
          <SobreNosSection />
          <Suspense fallback={<div className="h-screen" />}>
            <MissionVisionValuesSection />
            <InfoCardsSection />
            <GuidesSection />
            <PillarCarousel />
            <MembershipCardsSection />
            <FAQSection />
          </Suspense>
          <DemoFloatingButton />
        </div>
      </ScrollAnimationProvider>
    </CloudsScrollProvider>
  );
};

export default Index;