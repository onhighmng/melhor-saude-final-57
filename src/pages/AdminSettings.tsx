import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Building2,
  Users,
  UserCog,
  Calendar,
  FileText,
  Bell,
  Settings,
  Shield
} from "lucide-react";

interface CompanySettings {
  autoApproveNewCompanies: boolean;
  requireNUITVerification: boolean;
  defaultSessionsAllocation: number;
  maxEmployeesPerCompany: number;
}

interface UserSettings {
  autoActivateUsers: boolean;
  requireEmailVerification: boolean;
  defaultQuotaPerUser: number;
  allowSelfRegistration: boolean;
}

interface ProviderSettings {
  autoApproveProviders: boolean;
  requireVideoIntro: boolean;
  defaultSessionDuration: number;
  maxSessionsPerDay: number;
}

interface SessionSettings {
  slotGranularity: string;
  sessionBuffer: number;
  cancelWindow: number;
  rescheduleWindow: number;
  noShowDeduction: boolean;
}

interface BillingSettings {
  autoGenerateInvoices: boolean;
  invoiceDay: number;
  paymentTermsDays: number;
  lateFeePercentage: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowQuotaThreshold: number;
  sessionReminderHours: number;
}

interface PlatformSettings {
  companies: CompanySettings;
  users: UserSettings;
  providers: ProviderSettings;
  sessions: SessionSettings;
  billing: BillingSettings;
  notifications: NotificationSettings;
  dataRetention: "6months" | "1year" | "2years" | "5years";
  flags: {
    encryptRecordings: boolean;
    notifyAdminOnPHI: boolean;
    requireJustification: boolean;
  };
}

const defaultSettings: PlatformSettings = {
  companies: {
    autoApproveNewCompanies: false,
    requireNUITVerification: true,
    defaultSessionsAllocation: 100,
    maxEmployeesPerCompany: 500
  },
  users: {
    autoActivateUsers: true,
    requireEmailVerification: true,
    defaultQuotaPerUser: 10,
    allowSelfRegistration: false
  },
  providers: {
    autoApproveProviders: false,
    requireVideoIntro: true,
    defaultSessionDuration: 60,
    maxSessionsPerDay: 8
  },
  sessions: {
    slotGranularity: "30",
    sessionBuffer: 5,
    cancelWindow: 24,
    rescheduleWindow: 24,
    noShowDeduction: true
  },
  billing: {
    autoGenerateInvoices: true,
    invoiceDay: 1,
    paymentTermsDays: 30,
    lateFeePercentage: 5
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    lowQuotaThreshold: 3,
    sessionReminderHours: 24
  },
  dataRetention: "1year",
  flags: {
    encryptRecordings: true,
    notifyAdminOnPHI: true,
    requireJustification: true
  }
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('platform_settings').select('*');
      if (data) {
        const loaded = data.reduce((acc, item) => {
          if (item.setting_key === 'dataRetention') {
            acc.dataRetention = (item.setting_value as any)?.value;
          } else {
            acc[item.setting_key] = item.setting_value as any;
          }
          return acc;
        }, {} as Partial<PlatformSettings>);
        setSettings({ ...defaultSettings, ...loaded });
      }
    };
    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const updateFlags = (flag: keyof PlatformSettings['flags'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      flags: { ...prev.flags, [flag]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save each setting category to platform_settings
      await supabase.from('platform_settings').upsert([
        { setting_key: 'companies', setting_value: settings.companies as any, setting_type: 'config' },
        { setting_key: 'users', setting_value: settings.users as any, setting_type: 'config' },
        { setting_key: 'providers', setting_value: settings.providers as any, setting_type: 'config' },
        { setting_key: 'sessions', setting_value: settings.sessions as any, setting_type: 'config' },
        { setting_key: 'billing', setting_value: settings.billing as any, setting_type: 'config' },
        { setting_key: 'notifications', setting_value: settings.notifications as any, setting_type: 'config' },
        { setting_key: 'dataRetention', setting_value: { value: settings.dataRetention } as any, setting_type: 'config' },
        { setting_key: 'flags', setting_value: settings.flags as any, setting_type: 'security' }
      ], { onConflict: 'setting_key' });

      setHasUnsavedChanges(false);
      toast({
        title: "Configurações guardadas",
        description: "Todas as alterações foram aplicadas com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao guardar configurações",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Configurações repostas",
      description: "Todas as configurações foram repostas para os valores padrão.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Plataforma
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure todos os aspetos da plataforma Melhor Saúde
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alterações não guardadas
          </Badge>
        )}
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Repor Padrões
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configurações
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 gap-2">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Prestadores
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Faturação
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-vibrant-blue/10 to-vibrant-blue/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <Building2 className="h-5 w-5 text-vibrant-blue" />
                Configurações de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto-aprovar novas empresas</Label>
                    <Switch
                      checked={settings.companies.autoApproveNewCompanies}
                      onCheckedChange={(value) => updateSettings({ 
                        companies: { ...settings.companies, autoApproveNewCompanies: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Empresas serão ativadas automaticamente após registo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Exigir verificação de NUIT</Label>
                    <Switch
                      checked={settings.companies.requireNUITVerification}
                      onCheckedChange={(value) => updateSettings({ 
                        companies: { ...settings.companies, requireNUITVerification: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verificar NUIT antes de ativar empresa
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Alocação padrão de sessões
                  </Label>
                  <Input
                    type="number"
                    value={settings.companies.defaultSessionsAllocation}
                    onChange={(e) => updateSettings({ 
                      companies: { ...settings.companies, defaultSessionsAllocation: parseInt(e.target.value) }
                    })}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de sessões atribuídas por defeito
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Máximo de colaboradores por empresa
                  </Label>
                  <Input
                    type="number"
                    value={settings.companies.maxEmployeesPerCompany}
                    onChange={(e) => updateSettings({ 
                      companies: { ...settings.companies, maxEmployeesPerCompany: parseInt(e.target.value) }
                    })}
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-green/10 to-emerald-green/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <Users className="h-5 w-5 text-emerald-green" />
                Configurações de Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto-ativar utilizadores</Label>
                    <Switch
                      checked={settings.users.autoActivateUsers}
                      onCheckedChange={(value) => updateSettings({ 
                        users: { ...settings.users, autoActivateUsers: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativar contas automaticamente após registo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Exigir verificação de email</Label>
                    <Switch
                      checked={settings.users.requireEmailVerification}
                      onCheckedChange={(value) => updateSettings({ 
                        users: { ...settings.users, requireEmailVerification: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilizadores devem verificar email antes de aceder
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Quota padrão por utilizador
                  </Label>
                  <Input
                    type="number"
                    value={settings.users.defaultQuotaPerUser}
                    onChange={(e) => updateSettings({ 
                      users: { ...settings.users, defaultQuotaPerUser: parseInt(e.target.value) }
                    })}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sessões disponíveis para novos utilizadores
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Permitir auto-registo</Label>
                    <Switch
                      checked={settings.users.allowSelfRegistration}
                      onCheckedChange={(value) => updateSettings({ 
                        users: { ...settings.users, allowSelfRegistration: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permitir registo direto sem convite
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-accent-sky/10 to-accent-sky/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <UserCog className="h-5 w-5 text-accent-sky" />
                Configurações de Prestadores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto-aprovar prestadores</Label>
                    <Switch
                      checked={settings.providers.autoApproveProviders}
                      onCheckedChange={(value) => updateSettings({ 
                        providers: { ...settings.providers, autoApproveProviders: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativar prestadores automaticamente
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Exigir vídeo de apresentação</Label>
                    <Switch
                      checked={settings.providers.requireVideoIntro}
                      onCheckedChange={(value) => updateSettings({ 
                        providers: { ...settings.providers, requireVideoIntro: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prestadores devem gravar vídeo de apresentação
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Duração padrão de sessão (minutos)
                  </Label>
                  <Select 
                    value={settings.providers.defaultSessionDuration.toString()} 
                    onValueChange={(value) => updateSettings({ 
                      providers: { ...settings.providers, defaultSessionDuration: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Máximo de sessões por dia
                  </Label>
                  <Input
                    type="number"
                    value={settings.providers.maxSessionsPerDay}
                    onChange={(e) => updateSettings({ 
                      providers: { ...settings.providers, maxSessionsPerDay: parseInt(e.target.value) }
                    })}
                    min={1}
                    max={12}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-royal-blue/10 to-royal-blue/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <Calendar className="h-5 w-5 text-royal-blue" />
                Configurações de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tamanho do slot de marcação</Label>
                  <Select 
                    value={settings.sessions.slotGranularity} 
                    onValueChange={(value) => updateSettings({ 
                      sessions: { ...settings.sessions, slotGranularity: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Buffer entre sessões: {settings.sessions.sessionBuffer} minutos
                  </Label>
                  <Slider
                    value={[settings.sessions.sessionBuffer]}
                    onValueChange={([value]) => updateSettings({ 
                      sessions: { ...settings.sessions, sessionBuffer: value }
                    })}
                    max={30}
                    min={0}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 min</span>
                    <span>30 min</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Janela de cancelamento: {settings.sessions.cancelWindow} horas
                  </Label>
                  <Slider
                    value={[settings.sessions.cancelWindow]}
                    onValueChange={([value]) => updateSettings({ 
                      sessions: { ...settings.sessions, cancelWindow: value }
                    })}
                    max={72}
                    min={1}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1h</span>
                    <span>72h</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Janela de reagendamento: {settings.sessions.rescheduleWindow} horas
                  </Label>
                  <Slider
                    value={[settings.sessions.rescheduleWindow]}
                    onValueChange={([value]) => updateSettings({ 
                      sessions: { ...settings.sessions, rescheduleWindow: value }
                    })}
                    max={72}
                    min={1}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1h</span>
                    <span>72h</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Deduzir quota por falta</Label>
                    <Switch
                      checked={settings.sessions.noShowDeduction}
                      onCheckedChange={(value) => updateSettings({ 
                        sessions: { ...settings.sessions, noShowDeduction: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deduzir sessão se utilizador faltar sem aviso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-peach-orange/10 to-peach-orange/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <FileText className="h-5 w-5 text-peach-orange" />
                Configurações de Faturação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Gerar faturas automaticamente</Label>
                    <Switch
                      checked={settings.billing.autoGenerateInvoices}
                      onCheckedChange={(value) => updateSettings({ 
                        billing: { ...settings.billing, autoGenerateInvoices: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Faturas geradas no início de cada mês
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Dia de faturação
                  </Label>
                  <Input
                    type="number"
                    value={settings.billing.invoiceDay}
                    onChange={(e) => updateSettings({ 
                      billing: { ...settings.billing, invoiceDay: parseInt(e.target.value) }
                    })}
                    min={1}
                    max={28}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Dia do mês para gerar faturas (1-28)
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Prazo de pagamento (dias)
                  </Label>
                  <Input
                    type="number"
                    value={settings.billing.paymentTermsDays}
                    onChange={(e) => updateSettings({ 
                      billing: { ...settings.billing, paymentTermsDays: parseInt(e.target.value) }
                    })}
                    min={1}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Taxa de atraso (%)
                  </Label>
                  <Input
                    type="number"
                    value={settings.billing.lateFeePercentage}
                    onChange={(e) => updateSettings({ 
                      billing: { ...settings.billing, lateFeePercentage: parseInt(e.target.value) }
                    })}
                    min={0}
                    max={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentagem aplicada em pagamentos atrasados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-mint-green/10 to-mint-green/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <Bell className="h-5 w-5 text-mint-green" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Notificações por email</Label>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(value) => updateSettings({ 
                        notifications: { ...settings.notifications, emailNotifications: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enviar notificações por email
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Notificações por SMS</Label>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(value) => updateSettings({ 
                        notifications: { ...settings.notifications, smsNotifications: value }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enviar notificações por SMS
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Limite de quota baixa
                  </Label>
                  <Input
                    type="number"
                    value={settings.notifications.lowQuotaThreshold}
                    onChange={(e) => updateSettings({ 
                      notifications: { ...settings.notifications, lowQuotaThreshold: parseInt(e.target.value) }
                    })}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Notificar quando sessões restantes ≤ este valor
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Lembrete de sessão (horas antes)
                  </Label>
                  <Input
                    type="number"
                    value={settings.notifications.sessionReminderHours}
                    onChange={(e) => updateSettings({ 
                      notifications: { ...settings.notifications, sessionReminderHours: parseInt(e.target.value) }
                    })}
                    min={1}
                    max={72}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5">
              <CardTitle className="flex items-center gap-2 text-lg font-heading">
                <Shield className="h-5 w-5 text-purple-500" />
                Retenção de Dados e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Período de retenção de dados</Label>
                  <Select 
                    value={settings.dataRetention} 
                    onValueChange={(value: any) => updateSettings({ dataRetention: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          6 meses
                        </div>
                      </SelectItem>
                      <SelectItem value="1year">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          1 ano
                        </div>
                      </SelectItem>
                      <SelectItem value="2years">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          2 anos
                        </div>
                      </SelectItem>
                      <SelectItem value="5years">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          5 anos
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Define por quanto tempo os dados são mantidos
                  </p>
                </div>

                <div className="md:col-span-1">
                  <Label className="text-sm font-medium mb-3 block">Flags de segurança</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="encryptRecordings"
                        checked={settings.flags.encryptRecordings}
                        onCheckedChange={(checked) => updateFlags('encryptRecordings', checked as boolean)}
                      />
                      <Label htmlFor="encryptRecordings" className="text-sm font-normal cursor-pointer">
                        Encriptar gravações de sessões
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifyAdminOnPHI"
                        checked={settings.flags.notifyAdminOnPHI}
                        onCheckedChange={(checked) => updateFlags('notifyAdminOnPHI', checked as boolean)}
                      />
                      <Label htmlFor="notifyAdminOnPHI" className="text-sm font-normal cursor-pointer">
                        Notificar admin em acessos PHI
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requireJustification"
                        checked={settings.flags.requireJustification}
                        onCheckedChange={(checked) => updateFlags('requireJustification', checked as boolean)}
                      />
                      <Label htmlFor="requireJustification" className="text-sm font-normal cursor-pointer">
                        Exigir justificação para visualização
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;