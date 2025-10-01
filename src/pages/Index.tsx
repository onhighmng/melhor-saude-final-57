import React, { Suspense, lazy } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
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
  return (
    <CloudsScrollProvider>
      <ScrollAnimationProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <HeroSection />
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