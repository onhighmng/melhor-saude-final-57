import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import CompanySidebar from '@/components/CompanySidebar';
import { useAnimatedSidebar } from '@/components/ui/animated-sidebar';

interface CompanyLayoutProps {
  children: ReactNode;
}

function CompanyLayoutContent({ children }: { children: ReactNode }) {
  const { open } = useAnimatedSidebar();
  
  return (
    <motion.main
      className="flex-1 flex flex-col min-w-0"
      animate={{
        marginLeft: open ? '300px' : '60px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-none w-full mx-auto">
          {children}
        </div>
      </div>
    </motion.main>
  );
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <CompanySidebar />
        <CompanyLayoutContent>
          {children}
        </CompanyLayoutContent>
      </div>
    </SidebarProvider>
  );
}