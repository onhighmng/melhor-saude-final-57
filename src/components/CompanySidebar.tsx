import { LayoutDashboard, Users, BarChart3, Settings, HelpCircle, FileText, LogOut, Mail } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SupportContact } from "@/components/ui/support-contact";

const CompanySidebar = () => {
  const navigationItems = [
    { title: 'Dashboard', url: "/company/dashboard", icon: LayoutDashboard },
    { title: 'Colaboradores', url: "/company/employees", icon: Users, badge: "seatUsage" },
    { title: 'Códigos de Convite', url: "/company/invites", icon: Mail, badge: "activeCodes" },
    { title: 'Relatórios', url: "/company/reports", icon: BarChart3 },
    { title: 'Definições', url: "/company/settings", icon: Settings },
  ];

  const footerItems = [
    { title: 'Suporte', url: "/support", icon: HelpCircle },
    { title: 'Termos', url: "/terms", icon: FileText },
  ];

  // Mock seat usage data - in real app this would come from API/state
  const mockSeatData = {
    used: 18,
    limit: 25,
    activeCodes: 3,
  };
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

  const getSeatBadge = (badgeKey?: string) => {
    if (badgeKey === "seatUsage" && mockSeatData.limit > 0) {
      return `${mockSeatData.used}/${mockSeatData.limit}`;
    }
    if (badgeKey === "activeCodes") {
      return mockSeatData.activeCodes.toString();
    }
    return null;
  };

  return (
    <Sidebar
      collapsible="icon"
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
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {user?.name || user?.email}
              </span>
              <span className="text-xs text-muted-foreground">RH</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const badgeText = getSeatBadge(item.badge);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuItemWithTooltip item={item}>
                      <SidebarMenuButton asChild size="lg">
                        <NavLink to={item.url} end className={getNavCls}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <item.icon className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                              {!isCollapsed && <span>{item.title}</span>}
                            </div>
                            {!isCollapsed && badgeText && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {badgeText}
                              </Badge>
                            )}
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItemWithTooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Suporte' }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/support" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                  {!isCollapsed && <span>Suporte</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Termos' }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/terms" className="text-muted-foreground hover:text-foreground">
                  <FileText className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                  {!isCollapsed && <span>Termos</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Sair' }}>
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
};

export default CompanySidebar;