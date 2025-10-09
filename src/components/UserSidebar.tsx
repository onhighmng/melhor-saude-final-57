import { useState } from "react"
import { LayoutDashboard, MessageSquare, CalendarCheck, BookOpen, Settings, HelpCircle, FileText, LogOut, Bell, Calendar } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "react-i18next"

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


const footerItems = [
  { title: "Suporte", url: "/user/help", icon: HelpCircle },
  { title: "Termos", url: "/terms", icon: FileText },
]

export function UserSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation('navigation')
  const { t: tUser } = useTranslation('user')
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const mainItems = [
    { title: t('user.dashboard'), url: "/user/dashboard", icon: LayoutDashboard },
    { title: tUser('dashboard.ctaBookSession'), url: "/user/book-session", icon: Calendar },
    { title: t('user.sessions'), url: "/user/sessions", icon: CalendarCheck },
    { title: t('user.notifications'), url: "/user/notifications", icon: Bell, badge: 3 },
    { title: t('user.resources'), url: "/user/resources", icon: BookOpen },
    { title: t('user.help'), url: "/user/help", icon: HelpCircle },
    { title: t('company.settings'), url: "/user/settings", icon: Settings },
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
              <span className="text-xs text-muted-foreground">Utilizador</span>
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
            <SidebarMenuItemWithTooltip item={{ title: t('common:navigation.support') }}>
              <SidebarMenuButton asChild>
                <NavLink to="/support" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">{t('common:navigation.support')}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: t('common:navigation.terms') }}>
              <SidebarMenuButton asChild>
                <NavLink to="/terms" className="text-muted-foreground hover:text-foreground">
                  <FileText className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="text-base">{t('common:navigation.terms')}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuItemWithTooltip item={{ title: t('common:navigation.logout') }}>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span className="text-base">{t('common:navigation.logout')}</span>}
              </SidebarMenuButton>
            </SidebarMenuItemWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}