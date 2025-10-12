import { useState } from "react"
import { LayoutDashboard, MessageSquare, CalendarCheck, BookOpen, Settings, HelpCircle, FileText, LogOut, Bell, Calendar } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SupportContact } from "@/components/ui/support-contact"
import { NotificationBadge } from "@/components/notifications/NotificationBadge"


// Footer items now use translations inline

export function UserSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const mainItems = [
    { title: 'Dashboard', url: "/user/dashboard", icon: LayoutDashboard },
    { title: 'Agendar Sessão', url: "/user/book-session", icon: Calendar },
    { title: 'Minhas Sessões', url: "/user/sessions", icon: CalendarCheck },
    { title: 'Notificações', url: "/user/notifications", icon: Bell, badge: 3 },
    { title: 'Recursos', url: "/user/resources", icon: BookOpen },
    { title: 'Ajuda', url: "/user/help", icon: HelpCircle },
    { title: 'Definições', url: "/user/settings", icon: Settings },
  ]

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

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
      )
    }
    return <>{children}</>
  }

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
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {user?.name || user?.email}
              </span>
              <span className="text-xs text-muted-foreground">{tCommon('roles.user')}</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item}>
                    <SidebarMenuButton asChild size="lg">
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isCollapsed && (
                          <span className="text-base flex items-center justify-between flex-1">
                            {item.title}
                            {'badge' in item && item.badge && <NotificationBadge count={item.badge} />}
                          </span>
                        )}
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
            <SidebarMenuItemWithTooltip item={{ title: 'Ajuda' }}>
              <SidebarMenuButton asChild>
                <NavLink to="/support" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">Ajuda</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: 'Termos' }}>
              <SidebarMenuButton asChild>
                <NavLink to="/terms" className="text-muted-foreground hover:text-foreground">
                  <FileText className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">Termos</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
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
  )
}