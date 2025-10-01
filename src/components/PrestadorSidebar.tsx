import { Activity, CalendarRange, Clock, IdCard, HelpCircle, FileText, LogOut } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SupportContact } from "@/components/ui/support-contact";

const navigationItems = [
  { title: "Dashboard", url: "/prestador/dashboard", icon: Activity },
  { title: "Sessões", url: "/prestador/sessoes", icon: CalendarRange },
  { title: "Disponibilidade", url: "/prestador/availability", icon: Clock },
  { title: "Perfil", url: "/prestador/profile", icon: IdCard },
];

const footerItems = [
  { title: "Suporte", url: "/prestador/sessoes/guia", icon: HelpCircle },
  { title: "Termos", url: "/terms", icon: FileText },
];

export function PrestadorSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

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
      className="transition-all duration-300"
    >
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <SidebarTrigger />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">
                {user?.name || user?.email}
              </span>
              <span className="text-xs text-muted-foreground">Prestador</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item}>
                    <SidebarMenuButton asChild size="lg" className="h-12">
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isCollapsed && <span className="text-base">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItemWithTooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: "Suporte" }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/support" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                  {!isCollapsed && <span>Suporte</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: "Termos" }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/terms" className="text-muted-foreground hover:text-foreground">
                  <FileText className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                  {!isCollapsed && <span>Termos</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: "Sair" }}>
              <SidebarMenuButton 
                onClick={handleLogout}
                size="sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                {!isCollapsed && <span>Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}