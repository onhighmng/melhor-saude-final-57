import { ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileResponsiveWrapperProps {
  mobileComponent: ReactNode;
  desktopComponent: ReactNode;
  forceMobile?: boolean;
  forceDesktop?: boolean;
}

/**
 * Wrapper component that automatically switches between mobile and desktop versions
 * based on viewport size and device type
 */
export function MobileResponsiveWrapper({
  mobileComponent,
  desktopComponent,
  forceMobile = false,
  forceDesktop = false,
}: MobileResponsiveWrapperProps) {
  const isMobileViewport = useIsMobile();
  const [shouldShowMobile, setShouldShowMobile] = useState(false);

  useEffect(() => {
    // Check if we should force a specific version
    if (forceMobile) {
      setShouldShowMobile(true);
      return;
    }
    
    if (forceDesktop) {
      setShouldShowMobile(false);
      return;
    }

    // Otherwise use viewport detection
    setShouldShowMobile(isMobileViewport);
  }, [isMobileViewport, forceMobile, forceDesktop]);

  // Return the appropriate component
  return <>{shouldShowMobile ? mobileComponent : desktopComponent}</>;
}

/**
 * Hook to check if mobile UI should be shown
 */
export function useShouldShowMobile(): boolean {
  const isMobileViewport = useIsMobile();
  return isMobileViewport;
}

