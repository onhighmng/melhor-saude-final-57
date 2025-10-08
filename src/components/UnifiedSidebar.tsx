import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  GitBranch,
  RefreshCw,
  Calendar,
  ClipboardList,
  Mail,
  FileText,
  Settings,
  UserCheck,
  BookOpen,
  HelpCircle,
  LogOut,
  Shield,
  BarChart3,
  CalendarCheck,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportContact } from "@/components/ui/support-contact";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  tooltip?: string;
}

const getMenuItemsByRole = (role: string, t: any): MenuItem[] => {
  switch (role) {
    case 'user':
      return [
        { title: t('common:sidebar.dashboard'), url: "/user/dashboard", icon: LayoutDashboard },
        { title: t('common:sidebar.bookSession'), url: "/user/book", icon: Calendar },
        { title: t('common:sidebar.mySessions'), url: "/user/sessions", icon: ClipboardList },
        { title: t('common:sidebar.help'), url: "/user/help", icon: HelpCircle },
        { title: t('common:sidebar.settings'), url: "/user/settings", icon: Settings },
      ];
    
    case 'prestador':
      return [
        { title: t('common:sidebar.dashboard'), url: "/prestador/dashboard", icon: LayoutDashboard },
        { title: t('common:sidebar.sessions'), url: "/prestador/sessoes", icon: ClipboardList },
        { title: t('common:sidebar.availability'), url: "/prestador/availability", icon: Clock },
        { title: t('common:sidebar.profile'), url: "/prestador/profile", icon: User },
      ];
    
    case 'admin':
      return [
        { title: t('common:sidebar.dashboard'), url: "/admin/dashboard", icon: LayoutDashboard },
        { title: t('common:sidebar.companies'), url: "/admin/companies", icon: Building2 },
        { title: t('common:sidebar.users'), url: "/admin/usuarios", icon: Users },
        { title: t('common:sidebar.providers'), url: "/admin/prestadores", icon: UserCheck },
        { title: t('common:sidebar.support'), url: "/admin/support", icon: HelpCircle },
        { title: t('common:sidebar.matching'), url: "/admin/matching", icon: GitBranch },
        { title: t('common:sidebar.schedules'), url: "/admin/agendamentos", icon: Calendar },
        { title: t('common:sidebar.sessions'), url: "/admin/sessoes", icon: ClipboardList },
        { title: t('common:sidebar.emails'), url: "/admin/emails", icon: Mail },
        { title: t('common:sidebar.logs'), url: "/admin/logs", icon: FileText },
        { title: t('common:sidebar.configurations'), url: "/admin/configuracoes", icon: Settings },
      ];
    
    case 'hr':
      return [
        { title: t('common:sidebar.dashboard'), url: "/company/dashboard", icon: LayoutDashboard },
        { title: t('common:sidebar.employees'), url: "/company/employees", icon: Users },
        { title: t('common:sidebar.reports'), url: "/company/reports", icon: BarChart3 },
        { title: t('common:sidebar.settings'), url: "/company/settings", icon: Settings },
      ];
    
    default:
      return [];
  }
};

export function UnifiedSidebar() {
  const { open } = useSidebar();
  const { profile, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const currentPath = location.pathname;

  if (!isAuthenticated || !profile) {
    return null;
  }

  const menuItems = getMenuItemsByRole(profile.role, t);
  
  const isActive = (path: string) => currentPath === path;
  const getNavCls = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user': return t('sidebar.roles.user');
      case 'prestador': return t('sidebar.roles.provider');
      case 'admin': return t('sidebar.roles.admin');
      case 'hr': return t('sidebar.roles.hr');
      default: return t('sidebar.roles.system');
    }
  };

  return (
    <Sidebar
      className={open ? "w-64 border-r border-border" : "w-14 border-r border-border"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        {open && (
          <div className="space-y-2">
            <div className="font-semibold text-foreground">{t('sidebar.platformTitle')}</div>
            <div className="text-xs text-muted-foreground">
              {profile.company || t('sidebar.globalSystem')}
            </div>
            <Badge variant="secondary" className="text-xs">
              {getRoleLabel(profile.role)}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {open && t('sidebar.mainMenu')}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${getNavCls(isActive(item.url))}`}
                      title={!open ? item.title : item.tooltip}
                    >
                      <item.icon className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                      {open && (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="text-xs h-5 px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/support" 
                    className="flex items-center px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    title={!open ? t('sidebar.support') : undefined}
                  >
                    <HelpCircle className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">{t('sidebar.support')}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/terms" 
                    className="flex items-center px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    title={!open ? t('sidebar.terms') : undefined}
                  >
                    <Shield className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">{t('sidebar.terms')}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start px-3 py-2 h-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    title={!open ? t('logout') : undefined}
                  >
                    <LogOut className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">{t('logout')}</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}