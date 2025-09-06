import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings,
  Users,
  Bell,
  Shield,
  Mail,
  Save,
  Plus,
  X,
  Phone,
  MapPin
} from "lucide-react";

interface CompanySettings {
  companyInfo: {
    name: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    website: string;
  };
  quotaPolicies: {
    defaultCompanySessions: number;
    defaultPersonalSessions: number;
    renewalPeriod: "monthly" | "quarterly" | "yearly";
    rolloverAllowed: boolean;
  };
  customFields: Array<{
    id: string;
    name: string;
    type: "text" | "select" | "number";
    required: boolean;
    options?: string[];
  }>;
  notifications: {
    lowQuotaThreshold: number;
    emailAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    reminderEmails: boolean;
  };
  supportContacts: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  }>;
}

const defaultSettings: CompanySettings = {
  companyInfo: {
    name: "Tech Solutions Lda.",
    contactEmail: "rh@techsolutions.com",
    contactPhone: "+351 210 000 000",
    address: "Av. da Liberdade, 100 - 1250-146 Lisboa",
    website: "https://www.techsolutions.com"
  },
  quotaPolicies: {
    defaultCompanySessions: 12,
    defaultPersonalSessions: 4,
    renewalPeriod: "yearly",
    rolloverAllowed: true
  },
  customFields: [
    {
      id: "1",
      name: "Departamento",
      type: "select",
      required: true,
      options: ["Tecnologia", "Marketing", "Vendas", "RH", "Operações"]
    },
    {
      id: "2", 
      name: "Nível Seniority",
      type: "select",
      required: false,
      options: ["Júnior", "Sénior", "Lead", "Manager", "Director"]
    },
    {
      id: "3",
      name: "Número Colaborador",
      type: "number",
      required: true
    }
  ],
  notifications: {
    lowQuotaThreshold: 20,
    emailAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    reminderEmails: true
  },
  supportContacts: [
    {
      id: "1",
      name: "Ana Silva",
      email: "ana.silva@techsolutions.com",
      role: "HR Manager",
      department: "Recursos Humanos"
    },
    {
      id: "2",
      name: "Carlos Santos",
      email: "carlos.santos@techsolutions.com", 
      role: "Wellness Coordinator",
      department: "Recursos Humanos"
    }
  ]
};

const CompanySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    name: "",
    type: "text" as const,
    required: false,
    options: [] as string[]
  });
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    role: "",
    department: ""
  });

  const updateSettings = (section: keyof CompanySettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
    setHasUnsavedChanges(true);
  };

  const addCustomField = () => {
    if (!newCustomField.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do campo é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const field = {
      id: Date.now().toString(),
      ...newCustomField
    };

    setSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, field]
    }));

    setNewCustomField({
      name: "",
      type: "text",
      required: false,
      options: []
    });
    setHasUnsavedChanges(true);
  };

  const removeCustomField = (fieldId: string) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== fieldId)
    }));
    setHasUnsavedChanges(true);
  };

  const addSupportContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const contact = {
      id: Date.now().toString(),
      ...newContact
    };

    setSettings(prev => ({
      ...prev,
      supportContacts: [...prev.supportContacts, contact]
    }));

    setNewContact({
      name: "",
      email: "",
      role: "",
      department: ""
    });
    setHasUnsavedChanges(true);
  };

  const removeSupportContact = (contactId: string) => {
    setSettings(prev => ({
      ...prev,
      supportContacts: prev.supportContacts.filter(c => c.id !== contactId)
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving company settings:", settings);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Configurações guardadas",
      description: "Todas as alterações foram guardadas com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Configurações da Empresa
            </h1>
            <p className="text-muted-foreground">
              Gerir políticas, campos personalizados e contactos de suporte
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Alterações não guardadas
              </Badge>
            )}
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Guardar Alterações
            </Button>
          </div>
        </div>

        {/* Company Information */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyInfo.name}
                  onChange={(e) => updateSettings('companyInfo', { name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.companyInfo.website}
                  onChange={(e) => updateSettings('companyInfo', { website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.companyInfo.contactEmail}
                  onChange={(e) => updateSettings('companyInfo', { contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input
                  id="contactPhone"
                  value={settings.companyInfo.contactPhone}
                  onChange={(e) => updateSettings('companyInfo', { contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Morada</Label>
              <Textarea
                id="address"
                value={settings.companyInfo.address}
                onChange={(e) => updateSettings('companyInfo', { address: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quota Policies */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Políticas de Quota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="defaultCompanySessions">Sessões Empresa (padrão)</Label>
                <Input
                  id="defaultCompanySessions"
                  type="number"
                  value={settings.quotaPolicies.defaultCompanySessions}
                  onChange={(e) => updateSettings('quotaPolicies', { defaultCompanySessions: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="defaultPersonalSessions">Sessões Pessoais (padrão)</Label>
                <Input
                  id="defaultPersonalSessions"
                  type="number"
                  value={settings.quotaPolicies.defaultPersonalSessions}
                  onChange={(e) => updateSettings('quotaPolicies', { defaultPersonalSessions: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="renewalPeriod">Período de Renovação</Label>
                <Select
                  value={settings.quotaPolicies.renewalPeriod}
                  onValueChange={(value: any) => updateSettings('quotaPolicies', { renewalPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border z-50">
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Permitir rollover de sessões</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Sessões não utilizadas são transferidas para o próximo período
                </p>
              </div>
              <Switch
                checked={settings.quotaPolicies.rolloverAllowed}
                onCheckedChange={(checked) => updateSettings('quotaPolicies', { rolloverAllowed: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Campos Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Custom Fields */}
            <div className="space-y-3">
              {settings.customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{field.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeCustomField(field.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Custom Field */}
            <div className="border-t border-border pt-6">
              <h4 className="font-medium mb-4">Adicionar Novo Campo</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="fieldName">Nome do Campo</Label>
                  <Input
                    id="fieldName"
                    value={newCustomField.name}
                    onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
                    placeholder="Nome do campo..."
                  />
                </div>
                <div>
                  <Label htmlFor="fieldType">Tipo</Label>
                  <Select
                    value={newCustomField.type}
                    onValueChange={(value: any) => setNewCustomField({ ...newCustomField, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border z-50">
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newCustomField.required}
                      onCheckedChange={(checked) => setNewCustomField({ ...newCustomField, required: checked })}
                    />
                    <Label className="text-sm">Obrigatório</Label>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addCustomField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferências de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="lowQuotaThreshold">Limite de Alerta (% quota restante)</Label>
              <Input
                id="lowQuotaThreshold"
                type="number"
                value={settings.notifications.lowQuotaThreshold}
                onChange={(e) => updateSettings('notifications', { lowQuotaThreshold: parseInt(e.target.value) })}
                min="0"
                max="100"
                className="w-32"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Alertas por email</Label>
                  <p className="text-xs text-muted-foreground">
                    Receber alertas de quota baixa e outras notificações
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) => updateSettings('notifications', { emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Relatórios semanais</Label>
                  <p className="text-xs text-muted-foreground">
                    Resumo semanal de utilização
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => updateSettings('notifications', { weeklyReports: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Relatórios mensais</Label>
                  <p className="text-xs text-muted-foreground">
                    Relatório completo mensal para RH
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.monthlyReports}
                  onCheckedChange={(checked) => updateSettings('notifications', { monthlyReports: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Lembretes de sessão</Label>
                  <p className="text-xs text-muted-foreground">
                    Enviar lembretes aos colaboradores
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.reminderEmails}
                  onCheckedChange={(checked) => updateSettings('notifications', { reminderEmails: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Contacts */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contactos de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Contacts */}
            <div className="space-y-3">
              {settings.supportContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {contact.role}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {contact.department}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeSupportContact(contact.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Contact */}
            <div className="border-t border-border pt-6">
              <h4 className="font-medium mb-4">Adicionar Contacto de Suporte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="contactName">Nome</Label>
                  <Input
                    id="contactName"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Nome completo..."
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmailInput">Email</Label>
                  <Input
                    id="contactEmailInput"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactRole">Função</Label>
                  <Input
                    id="contactRole"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="HR Manager, etc..."
                  />
                </div>
                <div>
                  <Label htmlFor="contactDepartment">Departamento</Label>
                  <Input
                    id="contactDepartment"
                    value={newContact.department}
                    onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                    placeholder="Recursos Humanos, etc..."
                  />
                </div>
              </div>
              <Button onClick={addSupportContact} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contacto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettings;
