import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userUIcopy } from "@/data/userUIcopy";
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

const UserSettings = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isChangeProviderOpen, setIsChangeProviderOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState("");

  // Mock data for providers
  const fixedProviders = [
    {
      pillar: "Saúde Mental",
      provider: {
        name: "Dra. Ana Silva",
        specialty: "Psicóloga Clínica",
        avatar: "/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png"
      },
      status: "approved"
    },
    {
      pillar: "Bem-Estar Físico",
      provider: {
        name: "Dr. Miguel Santos",
        specialty: "Fisioterapeuta",
        avatar: "/lovable-uploads/085a608e-3a3e-45e5-898b-2f9b4c0f7f67.png"
      },
      status: "pending"
    },
    {
      pillar: "Assistência Financeira",
      provider: null,
      status: "none"
    },
    {
      pillar: "Assistência Jurídica",
      provider: {
        name: "Dr. João Costa",
        specialty: "Advogado Trabalhista",
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

  const [notifications, setNotifications] = useState({
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

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "As suas informações foram guardadas com sucesso."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas",
      description: "As suas preferências foram guardadas."
    });
  };

  const handleSaveConsents = () => {
    toast({
      title: "Consentimentos atualizados",
      description: "As suas preferências de privacidade foram guardadas."
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
        description: "As palavras-passe não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.new.length < 8) {
      toast({
        title: "Erro",
        description: "A palavra-passe deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    toast({
      title: "Palavra-passe alterada",
      description: "A sua palavra-passe foi atualizada com sucesso."
    });
  };

  const handleEnable2FA = () => {
    setShow2FADialog(false);
    toast({
      title: "2FA Ativado",
      description: "Autenticação de dois fatores foi ativada na sua conta."
    });
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
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Recusado";
      default:
        return "Sem prestador";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/user/dashboard')}
              className="h-10 w-10 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">As minhas Definições</h1>
                <p className="text-sm text-gray-500">Atualize os seus dados e preferências de conta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="consents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Consentimentos</span>
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Prestador Fixo</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize as suas informações pessoais aqui.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.name}</h3>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de telemóvel</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma preferido</Label>
                    <Select value={profileData.language} onValueChange={(value) => setProfileData({ ...profileData, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso horário</Label>
                    <Select value={profileData.timezone} onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Lisbon">Europa/Lisboa</SelectItem>
                        <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                        <SelectItem value="America/New_York">América/Nova York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  Guardar alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Pode gerir aqui como quer ser notificado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email de confirmação de sessão</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber email quando uma sessão for confirmada
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailConfirmation}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailConfirmation: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificação push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações push no dispositivo
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotification}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotification: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Lembrete 24h antes da sessão</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembrete no dia anterior à sessão
                      </p>
                    </div>
                    <Switch
                      checked={notifications.reminder24h}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, reminder24h: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Lembrete de feedback após sessão</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembrete para avaliar a sessão
                      </p>
                    </div>
                    <Switch
                      checked={notifications.feedbackReminder}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, feedbackReminder: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                  Guardar preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança & Acesso</CardTitle>
                <CardDescription>
                  Gerir as definições de segurança da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">Palavra-passe</Label>
                      <p className="text-sm text-muted-foreground">
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

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">Autenticação de dois fatores (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consents Tab */}
          <TabsContent value="consents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consentimentos</CardTitle>
                <CardDescription>
                  Gerir os seus consentimentos para tratamento de dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent-data"
                      checked={consents.dataProcessing}
                      onCheckedChange={(checked) => setConsents({ ...consents, dataProcessing: checked as boolean })}
                      disabled
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent-data" className="text-base">
                        Consentimento para tratamento de dados pessoais
                      </Label>
                      <p className="text-sm text-muted-foreground">
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
                      <Label htmlFor="consent-wellness" className="text-base">
                        Consentimento para comunicações de bem-estar
                      </Label>
                      <p className="text-sm text-muted-foreground">
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
                      <Label htmlFor="consent-anonymous" className="text-base">
                        Uso de dados anónimos em relatórios agregados
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Ajudar a melhorar os serviços através de análises agregadas.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveConsents} className="w-full md:w-auto">
                  Guardar consentimentos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fixed Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            {/* Pending request banner */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  Tem um pedido de troca pendente para Bem-Estar Físico.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prestador Fixo por Pilar</CardTitle>
                <CardDescription>
                  Os seus prestadores atribuídos em cada área de especialidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {fixedProviders.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.pillar}</h4>
                            {item.provider ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={item.provider.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {item.provider.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {item.provider.name} - {item.provider.specialty}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Nenhum prestador atribuído
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRequestProviderChange(item.pillar)}
                            disabled={item.status === "pending"}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Pedir troca
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Provider Change Modal */}
      <Dialog open={isChangeProviderOpen} onOpenChange={setIsChangeProviderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pedir Troca de Prestador</DialogTitle>
            <DialogDescription>
              Indique o motivo para a troca de prestador em {selectedPillar}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da troca</Label>
              <Textarea 
                id="reason"
                placeholder="Descreva o motivo para solicitar a troca do prestador..."
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <Label>Preferências (opcional)</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pref-gender" />
                  <Label htmlFor="pref-gender" className="text-sm">Preferência de género</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pref-language" />
                  <Label htmlFor="pref-language" className="text-sm">Preferência de língua</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pref-schedule" />
                  <Label htmlFor="pref-schedule" className="text-sm">Preferência de horário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pref-experience" />
                  <Label htmlFor="pref-experience" className="text-sm">Preferência de experiência específica</Label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsChangeProviderOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setIsChangeProviderOpen(false);
                toast({
                  title: "Pedido enviado",
                  description: "O seu pedido de troca será analisado pela equipa."
                });
              }}>
                Enviar Pedido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;