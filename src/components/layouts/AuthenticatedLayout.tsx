import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UnifiedSidebar } from '@/components/UnifiedSidebar';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UnifiedSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}