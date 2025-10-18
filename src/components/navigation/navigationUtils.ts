
export const scrollToSobreNos = () => {
  console.log('[Scroll] Scroll to Sobre Nos called');
  
  // Look for the Sobre Nos section by its ID
  const sobreNosSection = document.getElementById('sobre-nos');
  
  if (sobreNosSection) {
    console.log('[Scroll] Found Sobre Nos section, scrolling...');
    
    const rect = sobreNosSection.getBoundingClientRect();
    const navigationHeight = 80; // Account for fixed navigation
    const targetPosition = window.pageYOffset + rect.top - navigationHeight;
    
    console.log('[Scroll] Scroll calculation:', {
      currentScroll: window.pageYOffset,
      sectionTop: rect.top,
      navigationHeight,
      targetPosition
    });
    
    // Use smooth scrolling to the section
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  } else {
    console.log('[Scroll] Sobre Nos section not found, using fallback');
    // Fallback - scroll to roughly where the section should be
    const fallbackPosition = window.innerHeight * 1.5; // After hero sections
    window.scrollTo({
      top: fallbackPosition,
      behavior: 'smooth'
    });
  }
};

export const scrollToPillar = (pillarIndex: number) => {
  console.log('[Scroll] Scroll to pillar called with index:', pillarIndex);
  
  // Find the InfoCardsSection - it's the section with h-[500vh] class
  const infoCardsSection = document.querySelector('section.h-\\[500vh\\]');
  
  if (!infoCardsSection) {
    console.log('[Scroll] InfoCardsSection not found, trying alternative selector');
    
    // Try to find it by looking for the section that contains PillarStep components
    const sections = document.querySelectorAll('section');
    let targetSection = null;
    
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      // InfoCardsSection should be very tall (500vh = 5 * viewport height)
      if (rect.height > window.innerHeight * 4) {
        targetSection = section;
        console.log('[Scroll] Found InfoCardsSection by height');
        break;
      }
    }
    
    if (!targetSection) {
      console.log('[Scroll] Could not find InfoCardsSection at all, using estimated position');
      const estimatedTop = window.innerHeight * 2.5 + (pillarIndex * window.innerHeight * 1.2);
      window.scrollTo({
        top: estimatedTop,
        behavior: 'smooth'
      });
      return;
    }
    
    // Use the found section
    scrollToSpecificPillar(targetSection, pillarIndex);
    return;
  }
  
  console.log('[Scroll] Found InfoCardsSection directly');
  scrollToSpecificPillar(infoCardsSection, pillarIndex);
};

function scrollToSpecificPillar(infoCardsSection: Element, pillarIndex: number) {
  const rect = infoCardsSection.getBoundingClientRect();
  const sectionTop = window.pageYOffset + rect.top;
  const sectionHeight = rect.height;
  const viewportHeight = window.innerHeight;
  
  console.log('[Scroll] Section details:', {
    sectionTop,
    sectionHeight,
    pillarIndex,
    viewportHeight
  });
  
  // Match the exact logic from useInfoCardsScroll hook
  // Target step: 0 (overview) + pillars 1-4, so pillarIndex + 1
  const targetStep = pillarIndex + 1;
  
  // Calculate the required progress to reach the target step
  // The hook uses: stepIndex = Math.floor(progress * 5)
  // So we need: progress = (targetStep + 0.5) / 5 to hit the middle of the step
  const targetProgress = (targetStep + 0.5) / 5;
  
  // The hook calculates sectionStart as the amount scrolled into the section
  // progress = sectionStart / (sectionHeight - viewportHeight)
  // So: sectionStart = progress * (sectionHeight - viewportHeight)
  const scrollableDistance = sectionHeight - viewportHeight;
  const targetSectionStart = targetProgress * scrollableDistance;
  
  // Final scroll position: section top + how much we need to scroll into the section
  const finalScrollPosition = sectionTop + targetSectionStart;
  
  console.log('[Scroll] Fixed scrolling to pillar:', {
    targetStep,
    targetProgress,
    scrollableDistance,
    targetSectionStart,
    finalScrollPosition
  });
  
  // Use smooth scrolling
  window.scrollTo({
    top: finalScrollPosition,
    behavior: 'smooth'
  });
}
