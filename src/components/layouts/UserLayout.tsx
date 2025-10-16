import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/UserSidebar';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface UserLayoutProps {
  children: ReactNode;
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
        <main className="flex-1 flex flex-col min-w-0 relative z-10 ml-[60px] md:ml-[60px] transition-[margin] duration-300 ease-in-out">
          <div className={`flex-1 overflow-auto ${isFullScreenPage ? '' : 'p-6'}`}>
            <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}