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
  Building2,
  Users,
  UserCog,
  GitPullRequest,
  Calendar,
  ClipboardCheck,
  Mail,
  Shuffle,
  FileSearch,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  UsersIcon,
  Activity,
  Shield,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SupportContact } from "@/components/ui/support-contact";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
}

// Standalone items
const standaloneItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
];

// Grouped items
const groupedItems = {
  users: {
    title: "Gestão de Utilizadores",
    icon: UsersIcon,
    items: [
      { title: "Empresas", url: "/admin/companies", icon: Building2 },
      { title: "Utilizadores", url: "/admin/usuarios", icon: Users },
      { title: "Prestadores", url: "/admin/prestadores", icon: UserCog },
    ] as MenuItem[]
  },
  operations: {
    title: "Operações",
    icon: Activity,
    items: [
      { title: "Matching", url: "/admin/matching", icon: GitPullRequest },
      { title: "Agendamentos", url: "/admin/agendamentos", icon: Calendar },
      { title: "Sessões", url: "/admin/sessoes", icon: ClipboardCheck },
    ] as MenuItem[]
  },
  monitoring: {
    title: "Monitorização",
    icon: Shield,
    items: [
      { title: "Suporte", url: "/admin/support", icon: Mail, badge: "emailsFailed" },
      { title: "Pedidos de troca", url: "/admin/providers/change-requests", icon: Shuffle, badge: "pendingRequests" },
      { title: "Logs", url: "/admin/logs", icon: FileSearch, badge: "logAlerts" },
    ] as MenuItem[]
  }
};

const settingsItems: MenuItem[] = [
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
];

const footerItems: MenuItem[] = [
  { title: "Suporte", url: "/support", icon: HelpCircle },
  { title: "Termos", url: "/terms", icon: FileText },
];

// Mock badge data - in real app this would come from API/state
const mockBadgeData = {
  emailsFailed: 3,
  pendingRequests: 7,
  logAlerts: 2,
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // State for collapsible groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    users: false,
    operations: false,
    monitoring: false,
  });

  const toggleGroup = (groupKey: string) => {
    if (!isCollapsed) {
      setOpenGroups(prev => ({
        ...prev,
        [groupKey]: !prev[groupKey]
      }));
    }
  };

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

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey) return 0;
    return mockBadgeData[badgeKey as keyof typeof mockBadgeData] || 0;
  };

  const getGroupBadgeCount = (groupKey: keyof typeof groupedItems) => {
    return groupedItems[groupKey].items.reduce((total: number, item: MenuItem) => {
      return total + getBadgeCount(item.badge);
    }, 0);
  };

  const isGroupActive = (items: MenuItem[]) => {
    return items.some(item => currentPath === item.url);
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
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Standalone items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {standaloneItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <div className="flex items-center py-1">
                          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                          {!isCollapsed && <span className="text-base">{item.title}</span>}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItemWithTooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grouped items */}
        {Object.entries(groupedItems).map(([groupKey, group]) => {
          const groupBadgeCount = getGroupBadgeCount(groupKey as keyof typeof groupedItems);
          const isGroupExpanded = openGroups[groupKey];
          const hasActiveItem = isGroupActive(group.items);
          
          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-md p-3 transition-colors"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center">
                  <group.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base font-medium">{group.title}</span>}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-2">
                    {groupBadgeCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-2 text-sm">
                        {groupBadgeCount}
                      </Badge>
                    )}
                    {isGroupExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </SidebarGroupLabel>
              
              {(isCollapsed || isGroupExpanded) && (
                <SidebarGroupContent className={isCollapsed ? "" : "pl-6"}>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const badgeCount = getBadgeCount(item.badge);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuItemWithTooltip item={item}>
                            <SidebarMenuButton asChild>
                              <NavLink to={item.url} end className={getNavCls}>
                                 <div className="flex items-center justify-between w-full py-1">
                                   <div className="flex items-center">
                                     <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                                     {!isCollapsed && <span className="text-base">{item.title}</span>}
                                  </div>
                                   {!isCollapsed && badgeCount > 0 && (
                                     <Badge variant="destructive" className="h-6 px-2 text-sm">
                                       {badgeCount}
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
              )}
            </SidebarGroup>
          );
        })}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <div className="flex items-center py-1">
                          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                          {!isCollapsed && <span className="text-base">{item.title}</span>}
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
            <SidebarMenuItemWithTooltip item={{ title: "Suporte" }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/support" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">Suporte</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: "Termos" }}>
              <SidebarMenuButton asChild size="sm">
                <NavLink to="/terms" className="text-muted-foreground hover:text-foreground">
                  <FileText className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">Termos</span>}
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
                <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span className="text-base">Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}