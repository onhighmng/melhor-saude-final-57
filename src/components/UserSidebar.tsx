import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AnimatedSidebar,
  AnimatedSidebarBody,
  AnimatedSidebarLink,
  useAnimatedSidebar,
} from "@/components/ui/animated-sidebar";
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Bell,
  BookOpen,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UserSidebar() {
  const { open } = useAnimatedSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const mainLinks = [
    {
      label: "Início",
      href: "/user/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Agendar Sessão",
      href: "/user/book",
      icon: <Calendar className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Meu percurso",
      href: "/user/sessions",
      icon: <CalendarCheck className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Recursos",
      href: "/user/resources",
      icon: <BookOpen className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Notificações",
      href: "/user/notifications",
      icon: <Bell className="text-primary h-5 w-5 flex-shrink-0" />,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
    },
    {
      label: "Definições",
      href: "/user/settings",
      icon: <Settings className="text-primary h-5 w-5 flex-shrink-0" />,
    },
  ];

  const footerLinks = [
    {
      label: "Ajuda",
      href: "/support",
      icon: <HelpCircle className="text-muted-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Termos",
      href: "/terms",
      icon: <FileText className="text-muted-foreground h-5 w-5 flex-shrink-0" />,
    },
  ];

  useEffect(() => {
    if (!user?.id) return undefined;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (error) {
        // Silent fail for unread count
      }
    };

    fetchUnreadCount();

    const subscription = supabase
      .channel('notification-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AnimatedSidebar>
      <AnimatedSidebarBody className="justify-between gap-10 h-full">
        <div className="flex flex-col flex-1 overflow-hidden">
          <Logo open={open} user={user} role="Utilizador" />
          <div className="mt-8 flex flex-col gap-2">
            {mainLinks.map((link, idx) => (
              <AnimatedSidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {footerLinks.map((link, idx) => (
            <AnimatedSidebarLink key={idx} link={link} />
          ))}
          <button
            onClick={handleLogout}
            className={cn(
              "flex flex-row items-center gap-2 group/sidebar py-2 px-2 rounded-lg transition-colors hover:bg-muted/50 w-full",
              open ? "justify-start" : "justify-center"
            )}
          >
            <span className="flex-shrink-0">
              <LogOut className="text-muted-foreground h-5 w-5" />
            </span>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-muted-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 flex-shrink-0"
            >
              Sair
            </motion.span>
          </button>
        </div>
      </AnimatedSidebarBody>
    </AnimatedSidebar>
  );
}

const Logo = ({ open, user, role }: { open: boolean; user: any; role: string }) => {
  return (
    <div className={cn(
      "flex items-center py-2",
      open ? "gap-3 justify-start" : "justify-center"
    )}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={user?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <motion.div
        animate={{
          display: open ? "flex" : "none",
          opacity: open ? 1 : 0,
        }}
        className="flex flex-col min-w-0 flex-1"
      >
        <span className="text-sm font-medium text-foreground truncate">
          {user?.name || user?.email}
        </span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </motion.div>
    </div>
  );
};
