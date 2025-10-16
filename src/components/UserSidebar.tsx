import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AnimatedSidebar,
  AnimatedSidebarBody,
  AnimatedSidebarLink,
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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const mainLinks = [
    {
      label: "Dashboard",
      href: "/user/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Agendar Sessão",
      href: "/user/book-session",
      icon: <Calendar className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Meu percurso",
      href: "/user/sessions",
      icon: <CalendarCheck className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Notificações",
      href: "/user/notifications",
      icon: <Bell className="text-primary h-5 w-5 flex-shrink-0" />,
      badge: 3,
    },
    {
      label: "Recursos",
      href: "/user/resources",
      icon: <BookOpen className="text-primary h-5 w-5 flex-shrink-0" />,
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AnimatedSidebar open={open} setOpen={setOpen}>
      <AnimatedSidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo open={open} user={user} role="Utilizador" />
          <div className="mt-8 flex flex-col gap-2">
            {mainLinks.map((link, idx) => (
              <div key={idx} className="relative">
                <AnimatedSidebarLink link={link} />
                {link.badge && open && (
                  <Badge
                    variant="destructive"
                    className="absolute right-2 top-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {link.badge}
                  </Badge>
                )}
              </div>
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
              "flex items-center gap-2 group/sidebar py-2 px-2 rounded-lg transition-colors hover:bg-muted/50 w-full",
              open ? "justify-start" : "justify-center"
            )}
          >
            <LogOut className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-muted-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
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
