import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Mail,
  Settings,
  FileText,
  LogOut,
  UsersIcon,
  Activity,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
}


const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Main menu items
  const menuItems: MenuItem[] = [
    { title: 'Dashboard', url: "/admin/dashboard", icon: LayoutDashboard },
    { title: 'Gestão de Utilizadores', url: "/admin/users-management", icon: UsersIcon },
    { title: 'Operações', url: "/admin/operations", icon: Activity },
    { title: 'Conteúdos e Feedback', url: "/admin/resources", icon: FileText },
    { title: 'Finanças e Relatórios', url: "/admin/reports", icon: FileText },
    { title: 'Monitorização', url: "/admin/control-center", icon: Shield },
    { title: 'Suporte', url: "/admin/support", icon: Mail },
    { title: 'Definições', url: "/admin/settings", icon: Settings },
  ];


  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const SidebarMenuItemWithTooltip = ({ item, children }: { item: any, children: React.ReactNode }) => {
    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <>{children}</>;
  };


  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center justify-between mb-3">
          <SidebarTrigger />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-medium truncate">
                {user?.name || user?.email}
              </span>
              <span className="text-sm text-muted-foreground">Administrador</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-base">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <div className="flex items-center py-1">
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                          {!isCollapsed && <span className="text-base whitespace-nowrap">{item.title}</span>}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItemWithTooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-6 border-t ${isCollapsed ? 'flex justify-center' : ''}`}>
        <SidebarMenu className={isCollapsed ? 'items-center' : ''}>
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Sair' }}>
              <SidebarMenuButton 
                onClick={handleLogout}
                size="sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span className="text-base whitespace-nowrap">Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;