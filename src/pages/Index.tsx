import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import SobreNosSection from '@/components/SobreNosSection';
import MissionVisionValuesSection from '@/components/MissionVisionValuesSection';
import InfoCardsSection from '@/components/InfoCardsSection';
import GuidesSection from '@/components/GuidesSection';
import PillarCarousel from '@/components/PillarCarousel';
import MembershipCardsSection from '@/components/MembershipCardsSection';
import FAQSection from '@/components/FAQSection';
import CloudsScrollProvider from '@/components/clouds/CloudsScrollProvider';
import ScrollAnimationProvider from '@/components/guides/ScrollAnimationProvider';
import DemoFloatingButton from '@/components/DemoFloatingButton';

const Index = () => {
  return (
    <CloudsScrollProvider>
      <ScrollAnimationProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <HeroSection />
          <SobreNosSection />
          <MissionVisionValuesSection />
          <InfoCardsSection />
          <GuidesSection />
          <PillarCarousel />
          <MembershipCardsSection />
          <FAQSection />
          <DemoFloatingButton />
        </div>
      </ScrollAnimationProvider>
    </CloudsScrollProvider>
  );
};

export default Index;