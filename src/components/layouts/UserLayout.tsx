import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedSidebarProvider } from '@/components/ui/animated-sidebar';
import { UserSidebar } from '@/components/UserSidebar';
import { motion } from 'framer-motion';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/user/book' || location.pathname === '/user/dashboard' || location.pathname === '/user/resources' || location.pathname === '/user/settings' || location.pathname === '/user/sessions' || location.pathname === '/user/notifications';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AnimatedSidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <div className="h-screen flex w-full relative overflow-hidden bg-blue-50">
        <div className="fixed inset-0 z-0 opacity-10 bg-blue-50">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
        <UserSidebar />
        <motion.main 
          className="flex flex-col relative z-10 h-screen min-w-0 overflow-hidden"
          animate={{
            width: sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={`flex-1 overflow-y-auto ${isFullScreenPage ? '' : 'p-6'}`}>
            <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </AnimatedSidebarProvider>
  );
}