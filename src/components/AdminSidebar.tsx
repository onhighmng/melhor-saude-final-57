import { useState } from "react";
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
  Mail,
  Settings,
  FileText,
  LogOut,
  UsersIcon,
  Activity,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Gestão de Utilizadores",
      href: "/admin/users-management",
      icon: <UsersIcon className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Operações",
      href: "/admin/operations",
      icon: <Activity className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Conteúdos e Feedback",
      href: "/admin/resources",
      icon: <FileText className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Finanças e Relatórios",
      href: "/admin/reports",
      icon: <FileText className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Monitorização",
      href: "/admin/control-center",
      icon: <Shield className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Suporte",
      href: "/admin/support",
      icon: <Mail className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Definições",
      href: "/admin/settings",
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
    <AnimatedSidebar open={open} setOpen={setOpen}>
      <AnimatedSidebarBody className="justify-between gap-10">
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
};

const Logo = ({ open, user }: { open: boolean; user: any }) => {
  return (
    <div className={cn(
      "flex items-center py-2",
      open ? "gap-3 justify-start" : "justify-center"
    )}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
        </AvatarFallback>
      </Avatar>
      <motion.div
        animate={{
          display: open ? "flex" : "none",
          opacity: open ? 1 : 0,
        }}
        className="flex flex-col min-w-0 flex-1"
      >
        <span className="text-base font-medium text-foreground truncate">
          {user?.email || user?.name}
        </span>
        <span className="text-sm text-muted-foreground">Administrador</span>
      </motion.div>
    </div>
  );
};

export default AdminSidebar;
