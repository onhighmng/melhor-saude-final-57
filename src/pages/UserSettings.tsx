import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Shield, FileText, Users, Edit, AlertTriangle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Notification } from "@/components/notifications/NotificationCard";
import { ProfileEditModal } from "@/components/settings/ProfileEditModal";
import { NotificationPrefsModal } from "@/components/settings/NotificationPrefsModal";
import { SecurityModal } from "@/components/settings/SecurityModal";
import { ConsentsModal } from "@/components/settings/ConsentsModal";
import { NotificationHistoryModal } from "@/components/settings/NotificationHistoryModal";
import { supabase } from '@/integrations/supabase/client';

const UserSettings = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChangeProviderOpen, setIsChangeProviderOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState("");

  const [fixedProviders, setFixedProviders] = useState<any[]>([]);

  // Load assigned specialists
  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id || !profile?.company_id) return;
      
      const { data } = await supabase
        .from('specialist_assignments')
        .select(`
          pillar,
          is_active,
          specialist_id,
          specialist_profile:profiles!specialist_id(name, email)
        `)
        .eq('company_id', profile.company_id)
        .eq('is_active', true);

      const providers = (data || []).map((a: any) => ({
        pillar: a.pillar || 'Unknown',
        provider: a.specialist_profile ? {
          name: a.specialist_profile.name,
          specialty: a.pillar,
          avatar: null
        } : null,
        status: a.is_active ? 'approved' : 'none'
      }));

      setFixedProviders(providers);
    };

    loadAssignments();
  }, [user?.id, profile?.company_id]);

  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    language: "pt",
    timezone: "Europe/Lisbon"
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailConfirmation: true,
    pushNotification: false,
    reminder24h: true,
    feedbackReminder: true
  });

  const [consents, setConsents] = useState({
    dataProcessing: true,
    wellnessCommunications: false,
    anonymousReports: true
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load real notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const mappedNotifications: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        read: n.is_read,
        createdAt: n.created_at,
        actionUrl: typeof n.metadata === 'object' && n.metadata !== null ? (n.metadata as any).actionUrl : undefined,
        sessionId: typeof n.metadata === 'object' && n.metadata !== null ? (n.metadata as any).sessionId : undefined
      }));

      setNotifications(mappedNotifications);
    };

    loadNotifications();
  }, [user?.id]);
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleSaveProfile = async (profileData: any) => {
    try {
      if (!profile?.id) return;
      
      await supabase.from('profiles').update({
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url
      }).eq('id', profile.id);

      toast({
        title: 'Perfil atualizado',
        description: 'As suas alterações foram guardadas com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil',
        variant: 'destructive'
      });
    }
  };

  const handleSaveNotifications = async (preferences: any) => {
    try {
      if (!profile?.id) return;
      
      // Get existing metadata or initialize as empty object
      const existingMetadata = profile.metadata || {};
      
      await supabase.from('profiles').update({
        metadata: {
          ...existingMetadata,
          notifications: {
            email: preferences.emailConfirmation,
            push: preferences.pushNotification,
            reminder24h: preferences.reminder24h,
            feedback: preferences.feedbackReminder
          }
        }
      }).eq('id', profile.id);

      toast({
        title: 'Preferências atualizadas',
        description: 'As suas preferências de notificação foram guardadas.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar preferências',
        variant: 'destructive'
      });
    }
  };

  const handleSaveConsents = async (consents: any) => {
    try {
      if (!profile?.id) return;
      
      // Get existing metadata or initialize as empty object
      const existingMetadata = profile.metadata || {};
      
      await supabase.from('profiles').update({
        metadata: {
          ...existingMetadata,
          consents: {
            data_processing: consents.dataProcessing,
            marketing: consents.wellnessCommunications,
            analytics: consents.anonymousReports
          }
        }
      }).eq('id', profile.id);

      toast({
        title: 'Consentimentos atualizados',
        description: 'Os seus consentimentos foram guardados com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar consentimentos',
        variant: 'destructive'
      });
    }
  };

  const handleRequestProviderChange = (pillar: string) => {
    setSelectedPillar(pillar);
    setIsChangeProviderOpen(true);
  };

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifPrefsModalOpen, setIsNotifPrefsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isConsentsModalOpen, setIsConsentsModalOpen] = useState(false);
  const [isNotificationHistoryModalOpen, setIsNotificationHistoryModalOpen] = useState(false);

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.new.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Actually update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setShowPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast({
        title: 'Palavra-passe alterada',
        description: 'A sua palavra-passe foi atualizada com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const handleEnable2FA = () => {
    // Note: Supabase 2FA requires more complex setup with TOTP
    // For now, inform user this feature needs additional configuration
    setShow2FADialog(false);
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A autenticação de dois fatores estará disponível em breve.',
      variant: 'default'
    });
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast({
      title: 'Notificação marcada como lida',
      description: 'A notificação foi atualizada.'
    });
  };
  
  const handleNotificationAction = (notification: Notification) => {
    // Mark as read when taking action
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'session_reminder':
      case 'booking_confirmation':
        navigate('/user/sessions');
        break;
      case 'feedback_request':
        if (notification.sessionId) {
          navigate(`/user/feedback/${notification.sessionId}`);
        }
        break;
      case 'quota_warning':
        navigate('/user/book');
        break;
      case 'info':
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return 'Pendente';
      case "approved":
        return 'Aprovado';
      case "rejected":
        return 'Rejeitado';
      default:
        return 'Sem pedido';
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Modern Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/user/dashboard')}
              className="h-9 w-9 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Definições</h1>
                <p className="text-xs text-gray-500">Gerir as suas preferências e configurações</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-4">
        <BentoGrid className="lg:grid-rows-2">
          <BentoCard
            name="Perfil"
            description={profile?.name || "Utilizador"}
            Icon={Users}
            href="#"
            cta="Editar"
            className="lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />}
            onClick={() => setIsProfileModalOpen(true)}
          />

          <BentoCard
            name="Notificações"
            description={`${unreadNotifications.length} não lidas`}
            Icon={Bell}
            href="#"
            cta="Gerir"
            className="lg:row-start-1 lg:row-end-2 lg:col-start-2 lg:col-end-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />}
            onClick={() => setIsNotifPrefsModalOpen(true)}
          />

          <BentoCard
            name="Segurança"
            description="Palavra-passe & 2FA"
            Icon={Shield}
            href="#"
            cta="Configurar"
            className="lg:row-start-1 lg:row-end-2 lg:col-start-3 lg:col-end-4"
            background={<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50" />}
            onClick={() => setIsSecurityModalOpen(true)}
          />

          <BentoCard
            name="Consentimentos"
            description="Tratamento de dados"
            Icon={FileText}
            href="#"
            cta="Rever"
            className="lg:row-start-2 lg:row-end-3 lg:col-start-1 lg:col-end-2"
            background={<div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50" />}
            onClick={() => setIsConsentsModalOpen(true)}
          />

          <BentoCard
            name="Histórico de Notificações"
            description={`${notifications.length} notificações`}
            Icon={AlertTriangle}
            href="#"
            cta="Ver todas"
            className="lg:row-start-2 lg:row-end-3 lg:col-start-2 lg:col-end-4"
            background={<div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50" />}
            onClick={() => setIsNotificationHistoryModalOpen(true)}
          />
        </BentoGrid>

        {/* Modals */}
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          onSave={(data) => {
            setProfileData({ ...profileData, ...data });
            handleSaveProfile(data);
          }}
        />

        <NotificationPrefsModal
          isOpen={isNotifPrefsModalOpen}
          onClose={() => setIsNotifPrefsModalOpen(false)}
          preferences={notificationPreferences}
          onSave={(prefs) => {
            setNotificationPreferences(prefs);
            handleSaveNotifications(prefs);
          }}
        />

        <SecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          onChangePassword={handleChangePassword}
          onEnable2FA={handleEnable2FA}
        />

        <ConsentsModal
          isOpen={isConsentsModalOpen}
          onClose={() => setIsConsentsModalOpen(false)}
          consents={consents}
          onSave={(newConsents) => {
            setConsents(newConsents);
            handleSaveConsents(newConsents);
          }}
        />

        <NotificationHistoryModal
          isOpen={isNotificationHistoryModalOpen}
          onClose={() => setIsNotificationHistoryModalOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onNotificationAction={handleNotificationAction}
        />
      </div>
    </div>
  );
};

export default UserSettings;