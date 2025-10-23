import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
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

const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'user':
      return [
        { title: 'Início', url: "/user/dashboard", icon: LayoutDashboard },
        { title: 'Agendar Sessão', url: "/user/book", icon: Calendar },
        { title: 'Minhas Sessões', url: "/user/sessions", icon: ClipboardList },
        { title: 'Ajuda', url: "/user/help", icon: HelpCircle },
        { title: 'Definições', url: "/user/settings", icon: Settings },
      ];
    
    case 'prestador':
      return [
        { title: 'Dashboard', url: "/prestador/dashboard", icon: LayoutDashboard },
        { title: 'Sessões', url: "/prestador/sessoes", icon: ClipboardList },
        { title: 'Disponibilidade', url: "/prestador/availability", icon: Clock },
        { title: 'Perfil', url: "/prestador/profile", icon: User },
      ];
    
    case 'admin':
      return [
        { title: 'Dashboard', url: "/admin/dashboard", icon: LayoutDashboard },
        { title: 'Empresas', url: "/admin/companies", icon: Building2 },
        { title: 'Utilizadores', url: "/admin/usuarios", icon: Users },
        { title: 'Prestadores', url: "/admin/prestadores", icon: UserCheck },
        { title: 'Suporte', url: "/admin/support", icon: HelpCircle },
        { title: 'Matching', url: "/admin/matching", icon: GitBranch },
        { title: 'Agendamentos', url: "/admin/agendamentos", icon: Calendar },
        { title: 'Sessões', url: "/admin/sessoes", icon: ClipboardList },
        { title: 'Emails', url: "/admin/emails", icon: Mail },
        { title: 'Logs', url: "/admin/logs", icon: FileText },
        { title: 'Configurações', url: "/admin/configuracoes", icon: Settings },
      ];
    
    case 'hr':
      return [
        { title: 'Dashboard', url: "/company/dashboard", icon: LayoutDashboard },
        { title: 'Colaboradores', url: "/company/colaboradores", icon: Users },
        { title: 'Sessões', url: "/company/sessions", icon: Calendar },
        { title: 'Relatórios', url: "/company/relatorios", icon: BarChart3 },
        { title: 'Definições', url: "/company/settings", icon: Settings },
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
  const currentPath = location.pathname;

  if (!isAuthenticated || !profile) {
    return null;
  }

  const menuItems = getMenuItemsByRole(profile.role);
  
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
      case 'user': return 'Utilizador';
      case 'prestador': return 'Prestador';
      case 'admin': return 'Administrador';
      case 'hr': return 'RH';
      default: return 'Sistema';
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
            <div className="font-semibold text-foreground">Melhor Saúde</div>
            <div className="text-xs text-muted-foreground">
              {profile.company || 'Sistema Global'}
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
            {open && 'Menu Principal'}
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
                    title={!open ? 'Suporte' : undefined}
                  >
                    <HelpCircle className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">Suporte</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/terms" 
                    className="flex items-center px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    title={!open ? 'Termos' : undefined}
                  >
                    <Shield className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">Termos</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start px-3 py-2 h-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    title={!open ? 'Sair' : undefined}
                  >
                    <LogOut className={`h-4 w-4 ${open ? "mr-3" : ""}`} />
                    {open && <span className="text-sm">Sair</span>}
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