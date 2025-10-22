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
  Phone,
  Calendar,
  Users,
  ArrowRight,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EspecialistaSidebar = () => {
  const { open } = useAnimatedSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    {
      label: "Dashboard",
      href: "/especialista/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Pedidos de Chamada",
      href: "/especialista/call-requests",
      icon: <Phone className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Sessões Agendadas",
      href: "/especialista/sessions",
      icon: <Calendar className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Historial de Utilizadores",
      href: "/especialista/user-history",
      icon: <Users className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Encaminhamentos",
      href: "/especialista/referrals",
      icon: <ArrowRight className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Estatísticas",
      href: "/especialista/stats",
      icon: <TrendingUp className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Definições",
      href: "/especialista/settings",
      icon: <Settings className="text-primary h-5 w-5 flex-shrink-0" />,
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
          <Logo open={open} user={user} />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <AnimatedSidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
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
};

const Logo = ({ open, user }: { open: boolean; user: any }) => {
  return (
    <div className={cn(
      "flex items-center py-2",
      open ? "gap-3 justify-start" : "justify-center"
    )}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={user?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'E'}
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
        <span className="text-xs text-muted-foreground">Especialista Geral</span>
      </motion.div>
    </div>
  );
};

export default EspecialistaSidebar;
