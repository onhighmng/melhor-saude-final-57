import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/UserSidebar';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/user/chat';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <UserSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 overflow-auto bg-background ${isFullScreenPage ? '' : 'p-6'}`}>
            <div className={isFullScreenPage ? '' : 'max-w-none w-full mx-auto'}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}