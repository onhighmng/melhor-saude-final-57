
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollToPillar as utilScrollToPillar, scrollToSobreNos as utilScrollToSobreNos } from '@/components/navigation/navigationUtils';

export const usePillarNavigation = () => {
  const navigate = useNavigate();

  const scrollToPillar = useCallback((pillarIndex: number) => {
    console.log('[Pillar Navigation] Starting scroll to pillar:', pillarIndex);
    
    const executeScroll = () => {
      utilScrollToPillar(pillarIndex);
    };
    
    // Execute scroll with proper timing
    if (window.location.pathname !== '/') {
      console.log('[Navigation] Navigating to home first');
      navigate('/');
      // Wait for navigation and render with increased delay for better accuracy
      setTimeout(executeScroll, 800);
    } else {
      console.log('[Navigation] Already on home, scrolling immediately');
      // Small delay to ensure any dropdown state updates are complete
      setTimeout(executeScroll, 150);
    }
  }, [navigate]);

  const scrollToSobreNos = useCallback(() => {
    console.log('[Sobre Nos] Starting scroll');
    
    const executeScroll = () => {
      utilScrollToSobreNos();
    };
    
    if (window.location.pathname !== '/') {
      console.log('[Navigation] Navigating to home first');
      navigate('/');
      setTimeout(executeScroll, 800);
    } else {
      console.log('[Navigation] Already on home, scrolling immediately');
      setTimeout(executeScroll, 150);
    }
  }, [navigate]);

  return { scrollToPillar, scrollToSobreNos };
};
