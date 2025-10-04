import React from 'react';
import ScrollAnimationProvider from './guides/ScrollAnimationProvider';
import MainGuidesSection from './guides/MainGuidesSection';

const GuidesSection = () => {

  return (
    <div data-section="guides">
      <ScrollAnimationProvider>
        <MainGuidesSection />
      </ScrollAnimationProvider>
    </div>
  );
};

export default GuidesSection;
