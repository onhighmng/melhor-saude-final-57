import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-w-0">
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