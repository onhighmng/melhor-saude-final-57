import React, { Suspense, lazy } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { ModernHeroSection } from '@/components/ModernHeroSection';
import SobreNosSection from '@/components/SobreNosSection';

// Lazy load heavy below-the-fold components
const CloudsScrollProvider = lazy(() => import('@/components/clouds/CloudsScrollProvider'));
const ScrollAnimationProvider = lazy(() => import('@/components/guides/ScrollAnimationProvider'));
const MissionVisionValuesSection = lazy(() => import('@/components/MissionVisionValuesSection'));
const InfoCardsSection = lazy(() => import('@/components/InfoCardsSection'));
const GuidesSection = lazy(() => import('@/components/GuidesSection'));
const PillarCarousel = lazy(() => import('@/components/PillarCarousel'));
const MembershipCardsSection = lazy(() => import('@/components/MembershipCardsSection'));
const FAQSection = lazy(() => import('@/components/FAQSection'));
const DemoFloatingButton = lazy(() => import('@/components/DemoFloatingButton'));

// Lightweight loading skeleton
const LoadingSkeleton = () => (
  <div className="w-full bg-muted/20 animate-pulse" style={{ height: '60vh' }} />
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ModernHeroSection />
      <SobreNosSection />
      
      <Suspense fallback={<LoadingSkeleton />}>
        <CloudsScrollProvider>
          <ScrollAnimationProvider>
            <Suspense fallback={<LoadingSkeleton />}>
              <MissionVisionValuesSection />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <InfoCardsSection />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <GuidesSection />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <PillarCarousel />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <MembershipCardsSection />
            </Suspense>
            <Suspense fallback={<LoadingSkeleton />}>
              <FAQSection />
            </Suspense>
          </ScrollAnimationProvider>
        </CloudsScrollProvider>
      </Suspense>
      
      <Suspense fallback={null}>
        <DemoFloatingButton />
      </Suspense>
    </div>
  );
};

export default Index;