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

  const handleSaveProfile = () => {
    toast({
      title: 'Perfil atualizado',
      description: 'As suas alterações foram guardadas com sucesso.'
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Preferências atualizadas',
      description: 'As suas preferências de notificação foram guardadas.'
    });
  };

  const handleSaveConsents = () => {
    toast({
      title: 'Consentimentos atualizados',
      description: 'Os seus consentimentos foram guardados com sucesso.'
    });
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Row 1 - Profile and Notification Preferences side by side */}
          <div className="lg:col-span-6">
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full h-fit"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Informação do Perfil</h3>
                    <p className="text-xs text-gray-600">Atualize as suas informações pessoais e preferências</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-sm">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-base">{profile?.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  Guardar alterações
                </Button>
              </div>
            </BentoCard>
          </div>

          {/* Notification Preferences */}
          <div className="lg:col-span-6">
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full h-fit"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h3>
                    <p className="text-xs text-gray-600">Pode gerir aqui como quer ser notificado</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Email de confirmação de sessão</Label>
                      <p className="text-xs text-gray-600">Receber email quando uma sessão for confirmada</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.emailConfirmation}
                      onCheckedChange={(checked) => 
                        setNotificationPreferences({ ...notificationPreferences, emailConfirmation: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Notificação push</Label>
                      <p className="text-xs text-gray-600">Receber notificações push no dispositivo</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.pushNotification}
                      onCheckedChange={(checked) => 
                        setNotificationPreferences({ ...notificationPreferences, pushNotification: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Lembrete 24h antes da sessão</Label>
                      <p className="text-xs text-gray-600">Receber lembrete no dia anterior à sessão</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.reminder24h}
                      onCheckedChange={(checked) => 
                        setNotificationPreferences({ ...notificationPreferences, reminder24h: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Lembrete de feedback após sessão</Label>
                      <p className="text-xs text-gray-600">Receber lembrete para avaliar a sessão</p>
                    </div>
                    <Switch
                      checked={notificationPreferences.feedbackReminder}
                      onCheckedChange={(checked) => 
                        setNotificationPreferences({ ...notificationPreferences, feedbackReminder: checked })
                      }
                    />
                </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications} className="w-full">
                  Guardar preferências
                </Button>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Notifications - Full width card */}
          <div className="lg:col-span-12">
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full h-fit"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                    <p className="text-xs text-gray-600">{unreadNotifications.length} não lidas</p>
                  </div>
                </div>

                <Tabs defaultValue="unread" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="unread">
                      Não Lidas ({unreadNotifications.length})
            </TabsTrigger>
                    <TabsTrigger value="all">
                      Todas ({notifications.length})
            </TabsTrigger>
          </TabsList>
                  
                  <TabsContent value="unread" className="space-y-3">
                    {unreadNotifications.length > 0 ? (
                      <NotificationList
                        notifications={unreadNotifications.slice(0, 3)}
                        onMarkRead={handleMarkRead}
                        onAction={handleNotificationAction}
                      />
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-4">Sem notificações não lidas</p>
                    )}
          </TabsContent>

                  <TabsContent value="all" className="space-y-3">
                    <NotificationList
                      notifications={notifications.slice(0, 5)}
                      onMarkRead={handleMarkRead}
                      onAction={handleNotificationAction}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </BentoCard>
          </div>

          {/* Bottom row - Security and Consents */}
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Security */}
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full h-fit"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Segurança & Acesso</h3>
                    <p className="text-xs text-gray-600">Gerir as definições de segurança da sua conta</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm">Palavra-passe</Label>
                      <p className="text-xs text-muted-foreground">
                        Última alteração em 15 de Janeiro, 2024
                      </p>
                    </div>
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Alterar Palavra-Passe
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alterar Palavra-Passe</DialogTitle>
                          <DialogDescription>
                            Introduza a sua palavra-passe atual e escolha uma nova palavra-passe.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Palavra-passe atual</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={passwordData.current}
                              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">Nova palavra-passe</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={passwordData.new}
                              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar nova palavra-passe</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={passwordData.confirm}
                              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleChangePassword}>
                            Alterar Palavra-Passe
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm">Autenticação de dois fatores (2FA)</Label>
                      <p className="text-xs text-muted-foreground">
                        Estado: Desativado
                      </p>
                    </div>
                    <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Ativar 2FA
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ativar Autenticação de Dois Fatores</DialogTitle>
                          <DialogDescription>
                            Adicione uma camada extra de segurança à sua conta.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-muted p-4 rounded-lg text-center">
                            <p className="text-sm mb-2">Digitalize este código QR com a sua aplicação de autenticação:</p>
                            <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center rounded">
                              <div className="text-xs text-muted-foreground">[QR Code simulado]</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="2fa-code">Código de verificação</Label>
                            <Input
                              id="2fa-code"
                              placeholder="000000"
                              maxLength={6}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleEnable2FA}>
                            Ativar 2FA
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Consents */}
            <BentoCard
              name=""
              description=""
              href="#"
              cta=""
              className="w-full h-fit"
              background={<div className="absolute inset-0 bg-white" />}
              textColor="text-gray-900"
              descriptionColor="text-gray-600"
              onClick={() => {}}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Consentimentos</h3>
                    <p className="text-xs text-gray-600">Gerir os seus consentimentos para tratamento de dados</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent-data"
                      checked={consents.dataProcessing}
                      onCheckedChange={(checked) => setConsents({ ...consents, dataProcessing: checked as boolean })}
                      disabled
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent-data" className="text-sm">
                        Consentimento para tratamento de dados pessoais
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Obrigatório para o funcionamento da plataforma.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent-wellness"
                      checked={consents.wellnessCommunications}
                      onCheckedChange={(checked) => setConsents({ ...consents, wellnessCommunications: checked as boolean })}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent-wellness" className="text-sm">
                        Consentimento para comunicações de bem-estar
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receber dicas e conteúdos sobre saúde e bem-estar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent-anonymous"
                      checked={consents.anonymousReports}
                      onCheckedChange={(checked) => setConsents({ ...consents, anonymousReports: checked as boolean })}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent-anonymous" className="text-sm">
                        Uso de dados anónimos em relatórios agregados
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ajudar a melhorar os serviços através de análises agregadas.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveConsents} className="w-full md:w-auto mt-4">
                  Guardar consentimentos
                </Button>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;