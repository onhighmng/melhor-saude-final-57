import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
  PanelLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <SidebarTrigger className="h-8 w-8">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-normal truncate text-foreground">
                {user?.email || user?.name}
              </span>
              <span className="text-sm text-muted-foreground font-light">Administrador</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-base font-semibold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
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
                    <SidebarMenuButton asChild size="lg">
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className={`h-5 w-5 text-blue-500 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isCollapsed && <span className="text-base font-normal text-blue-500">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItemWithTooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t space-y-3">
        {!isCollapsed && (
          <Card className="border-muted">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilizador</span>
                <span className="font-medium">{user?.name || 'Admin'}</span>
              </div>
            </CardContent>
          </Card>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Sair' }}>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span className="text-base">Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;