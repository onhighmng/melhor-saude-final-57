import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import { useAnimatedSidebar } from '@/components/ui/animated-sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { open } = useAnimatedSidebar();
  
  return (
    <motion.main
      className="flex-1 flex flex-col min-w-0 overflow-hidden"
      animate={{
        marginLeft: open ? '300px' : '60px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex-1 overflow-auto p-6 bg-background pb-0">
        <div className="max-w-none w-full mx-auto pb-6">
          {children}
        </div>
      </div>
    </motion.main>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </div>
    </SidebarProvider>
  );
}