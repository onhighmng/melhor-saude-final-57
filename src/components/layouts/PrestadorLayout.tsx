import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedSidebarProvider } from '@/components/ui/animated-sidebar';
import { PrestadorSidebar } from '@/components/PrestadorSidebar';

interface PrestadorLayoutProps {
  children: ReactNode;
}

export function PrestadorLayout({ children }: PrestadorLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/prestador/chat';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AnimatedSidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <div className="h-screen flex w-full relative overflow-hidden">
        <PrestadorSidebar />
        <motion.main 
          className="flex flex-col relative z-10 h-screen min-w-0 overflow-hidden"
          animate={{
            width: sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={`flex-1 overflow-y-auto bg-gray-100 ${isFullScreenPage ? '' : 'p-6'}`}>
            <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </AnimatedSidebarProvider>
  );
}