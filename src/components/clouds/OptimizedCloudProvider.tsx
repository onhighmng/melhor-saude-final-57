import React, { ReactNode, useEffect, useState } from 'react';

interface OptimizedCloudProviderProps {
  children: ReactNode;
}

const OptimizedCloudProvider: React.FC<OptimizedCloudProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only enable clouds after initial page load
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <>{children}</>;
  }

  // Dynamically import CloudsScrollProvider only when ready
  const CloudsScrollProvider = React.lazy(() => import('./CloudsScrollProvider'));
  
  return (
    <React.Suspense fallback={<>{children}</>}>
      <CloudsScrollProvider>{children}</CloudsScrollProvider>
    </React.Suspense>
  );
};

export default OptimizedCloudProvider;
