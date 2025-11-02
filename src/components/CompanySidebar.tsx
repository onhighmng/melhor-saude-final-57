import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import {
  AnimatedSidebar,
  AnimatedSidebarBody,
  AnimatedSidebarLink,
  useAnimatedSidebar,
} from "@/components/ui/animated-sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  HelpCircle,
  FileText,
  LogOut,
  Calendar,
  Settings,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CompanySidebar = () => {
  const { open } = useAnimatedSidebar();
  const navigate = useNavigate();
  const { user, logout, profile } = useAuth();
  const [seatData, setSeatData] = useState({ used: 0, limit: 0 });

  useEffect(() => {
    const fetchSeatData = async () => {
      if (!profile?.company_id) return;

      try {
        // Use RPC function to get seat statistics
        const { data: seatStats, error } = await supabase
          .rpc('get_company_seat_stats' as any, { p_company_id: profile.company_id })
          .single();

        if (error) {
          console.error('Error fetching seat stats:', error);
          return;
        }

        if (seatStats) {
          const stats = seatStats as any;
          setSeatData({
            used: stats.active_employees || 0,
            limit: stats.employee_seats || 0
          });
        }
      } catch (error) {
        // Error fetching seat data - silently fail
        console.error('Error in fetchSeatData:', error);
      }
    };

    fetchSeatData();

    // Real-time subscription for employee and company changes
    const channel = supabase
      .channel('company_seat_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'company_employees', filter: `company_id=eq.${profile?.company_id}` },
        () => {
          fetchSeatData();
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'companies', filter: `id=eq.${profile?.company_id}` },
        () => {
          fetchSeatData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id]);

  const mainLinks = [
    {
      label: "Dashboard",
      href: "/company/dashboard",
      icon: <LayoutDashboard className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Colaboradores",
      href: "/company/colaboradores",
      icon: <Users className="text-primary h-5 w-5 flex-shrink-0" />,
      badge: `${seatData.used}/${seatData.limit}`,
    },
    {
      label: "Recursos",
      href: "/company/recursos",
      icon: <BookOpen className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Relatórios e Impacto",
      href: "/company/relatorios",
      icon: <BarChart3 className="text-primary h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Sessões",
      href: "/company/sessions",
      icon: <Calendar className="text-primary h-5 w-5 flex-shrink-0" />,
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
      // Logout error - silently fail, user will be redirected
    }
  };

  return (
    <AnimatedSidebar>
      <AnimatedSidebarBody className="justify-between gap-10 h-full">
        <div className="flex flex-col flex-1 overflow-hidden">
          <Logo open={open} user={user} role="RH" />
          <div className="mt-8 flex flex-col gap-2">
            {mainLinks.map((link, idx) => (
              <div key={idx} className="relative">
                <AnimatedSidebarLink link={link} />
                {link.badge && open && (
                  <Badge
                    variant="secondary"
                    className="absolute right-2 top-2 h-5 px-1.5 text-xs"
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

const Logo = ({ open, user, role }: { open: boolean; user: any; role: string }) => {
  return (
    <div className={cn(
      "flex items-center py-2",
      open ? "gap-3 justify-start" : "justify-center"
    )}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={user?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'C'}
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

export default CompanySidebar;
