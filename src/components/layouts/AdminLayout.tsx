import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedSidebarProvider } from '@/components/ui/animated-sidebar';
import AdminSidebar from '@/components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/admin/chat';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AnimatedSidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <div className="h-screen flex w-full relative overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        {/* Main content - full width on mobile, adjusted on desktop */}
        <motion.main 
          className="flex flex-col relative z-10 h-screen min-w-0 overflow-hidden w-full md:w-auto"
          animate={{
            width: typeof window !== 'undefined' && window.innerWidth >= 768 
              ? (sidebarOpen ? 'calc(100% - 300px)' : 'calc(100% - 60px)')
              : '100%',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={`flex-1 overflow-y-auto bg-gray-100 ${isFullScreenPage ? '' : 'md:p-6'}`}>
            <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </AnimatedSidebarProvider>
  );
}