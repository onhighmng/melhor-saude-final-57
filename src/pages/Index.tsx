import React, { Suspense, lazy } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { ModernHeroSection } from '@/components/ModernHeroSection';
import SobreNosSection from '@/components/SobreNosSection';
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer';
import { SentryTestButton, SentryTestMessages } from '@/components/SentryTestButton';

// Lazy load heavy below-the-fold components
const CloudsScrollProvider = lazy(() => import('@/components/clouds/CloudsScrollProvider'));
const ScrollAnimationProvider = lazy(() => import('@/components/guides/ScrollAnimationProvider'));
const MissionVisionValuesSection = lazy(() => import('@/components/MissionVisionValuesSection'));
const InfoCardsSection = lazy(() => import('@/components/InfoCardsSection'));
const GuidesSection = lazy(() => import('@/components/GuidesSection'));
const PillarCarousel = lazy(() => import('@/components/PillarCarousel'));
const PillarsInteractiveSection = lazy(() => import('@/components/PillarsInteractiveSection'));
const MembershipCardsSection = lazy(() => import('@/components/MembershipCardsSection'));
const FAQSection = lazy(() => import('@/components/FAQSection'));

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
      
      
      {/* Sentry Test Buttons - Development Only */}
      {import.meta.env.DEV && (
        <div className="py-8 px-4 bg-slate-100 border-t-2 border-dashed border-slate-300">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">🧪 Sentry Testing (Development Only)</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-3">Click to test error tracking:</p>
                <SentryTestButton />
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-3">Test different message levels:</p>
                <SentryTestMessages />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <StackedCircularFooter />
    </div>
  );
};

export default Index;