import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CompanySidebar } from '@/components/CompanySidebar';

interface CompanyLayoutProps {
  children: ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <CompanySidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-background px-4 md:hidden sticky top-0 z-40">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-auto p-6 bg-background">
            <div className="max-w-none w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}