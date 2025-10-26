import React, { useState } from "react";
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

  // Mock data for providers
  const fixedProviders = [
    {
      pillar: 'Saúde Mental',
      provider: {
        name: "Dra. Ana Silva",
        specialty: 'Psicóloga Clínica',
        avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png"
      },
      status: "approved"
    },
    {
      pillar: 'Bem-Estar Físico',
      provider: {
        name: "Dr. Miguel Santos",
        specialty: 'Fisioterapeuta',
        avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png"
      },
      status: "pending"
    },
    {
      pillar: 'Assistência Financeira',
      provider: null,
      status: "none"
    },
    {
      pillar: 'Assistência Jurídica',
      provider: {
        name: "Dr. João Costa",
        specialty: 'Advogado Laboralista',
        avatar: "/lovable-uploads/0daa1ba3-5b7c-49db-950f-22ccfee40b86.png"
      },
      status: "rejected"
    }
  ];

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

  // Mock notifications data from UserNotifications
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'session_reminder',
      title: 'Sessão Hoje',
      message: 'Tem uma sessão hoje às 14:00 com Dr. João Silva',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/user/sessions',
      sessionId: 'sess-1',
    },
    {
      id: 'notif-2',
      type: 'feedback_request',
      title: 'Avalie a Sessão',
      message: 'Que tal avaliar a sua sessão com Dra. Maria Santos?',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sessionId: 'sess-2',
    },
    {
      id: 'notif-3',
      type: 'quota_warning',
      title: 'Sessões a Expirar',
      message: 'Restam apenas 2 sessões. Renove o seu plano!',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'notif-4',
      type: 'booking_confirmation',
      title: 'Sessão Confirmada',
      message: 'A sua sessão foi confirmada para 25 de Março às 10:00',
      read: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      sessionId: 'sess-3',
    },
    {
      id: 'notif-5',
      type: 'info',
      title: 'Novos Recursos',
      message: 'Novos recursos de bem-estar disponíveis na sua área pessoal',
      read: true,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      actionUrl: '/user/resources',
    },
  ];
  
  const [notifications, setNotifications] = useState(mockNotifications);
  
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
      
      // Save to metadata or separate table
      await supabase.from('profiles').update({
        metadata: { notification_preferences: preferences }
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
      
      await supabase.from('profiles').update({
        metadata: { consents: consents }
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

  const handleChangePassword = () => {
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
    
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    toast({
      title: 'Palavra-passe alterada',
      description: 'A sua palavra-passe foi atualizada com sucesso.'
    });
  };

  const handleEnable2FA = () => {
    setShow2FADialog(false);
    toast({
      title: 'Autenticação de dois fatores ativada',
      description: '2FA foi ativado com sucesso na sua conta.'
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
            handleSaveProfile();
          }}
        />

        <NotificationPrefsModal
          isOpen={isNotifPrefsModalOpen}
          onClose={() => setIsNotifPrefsModalOpen(false)}
          preferences={notificationPreferences}
          onSave={(prefs) => {
            setNotificationPreferences(prefs);
            handleSaveNotifications();
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
            handleSaveConsents();
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