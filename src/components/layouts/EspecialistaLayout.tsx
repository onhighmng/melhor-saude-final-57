import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedSidebarProvider } from '@/components/ui/animated-sidebar';
import EspecialistaSidebar from '@/components/EspecialistaSidebar';

interface EspecialistaLayoutProps {
  children: ReactNode;
}

export function EspecialistaLayout({ children }: EspecialistaLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/especialista/chat';
  const isStaticPage = location.pathname === '/especialista/settings';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  return (
    <AnimatedSidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <div className="h-screen flex w-full relative overflow-hidden bg-gray-50">
        <EspecialistaSidebar />
        <motion.main 
          className="flex flex-col relative z-10 h-screen min-w-0 overflow-hidden bg-transparent"
          animate={{
            width: sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={`flex-1 ${isStaticPage ? 'overflow-hidden' : 'overflow-y-auto'} ${isFullScreenPage ? '' : 'p-6'} bg-transparent`}>
            <div className={isFullScreenPage ? '' : 'max-w-7xl w-full mx-auto h-full'}>
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </AnimatedSidebarProvider>
  );
}
