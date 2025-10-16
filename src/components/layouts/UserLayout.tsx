import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/UserSidebar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAnimatedSidebar } from '@/components/ui/animated-sidebar';

interface UserLayoutProps {
  children: ReactNode;
}

function UserLayoutContent({ children, isFullScreenPage }: { children: ReactNode; isFullScreenPage: boolean }) {
  const { open } = useAnimatedSidebar();
  
  return (
    <motion.main
      className="flex-1 flex flex-col min-w-0 relative z-10"
      animate={{
        marginLeft: open ? '300px' : '60px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className={`flex-1 overflow-auto ${isFullScreenPage ? '' : 'p-6'}`}>
        <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
          {children}
        </div>
      </div>
    </motion.main>
  );
}

export function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/user/chat';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full relative">
        <div className="fixed inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
        <UserSidebar />
        <UserLayoutContent isFullScreenPage={isFullScreenPage}>
          {children}
        </UserLayoutContent>
      </div>
    </SidebarProvider>
  );
}