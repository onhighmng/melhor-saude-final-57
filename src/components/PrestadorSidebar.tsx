import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AnimatedSidebar,
  AnimatedSidebarBody,
  AnimatedSidebarLink,
  useAnimatedSidebar,
} from "@/components/ui/animated-sidebar";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  TrendingUp,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PrestadorSidebar() {
  const { open } = useAnimatedSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const mainLinks = [
    {
      label: "Dashboard",
      href: "/prestador/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Calendário",
      href: "/prestador/calendario",
      icon: <Calendar className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Sessões",
      href: "/prestador/sessoes",
      icon: <Clock className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Desempenho",
      href: "/prestador/desempenho",
      icon: <TrendingUp className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Perfil e Configurações",
      href: "/prestador/configuracoes",
      icon: <Settings className="text-primary h-5 w-5 flex-shrink-0" />,
    },
  ];

  const footerLinks = [
    {
      label: "Suporte",
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
    <AnimatedSidebar>
      <AnimatedSidebarBody className="justify-between gap-10 h-full">
        <div className="flex flex-col flex-1 overflow-hidden">
          <Logo open={open} user={user} role="Affiliate" />
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
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'P'}
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
