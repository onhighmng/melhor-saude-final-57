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
import { companyToasts } from "@/data/companyToastMessages";
import { UnsavedChangesBanner } from "@/components/company/UnsavedChangesBanner";
import { useTranslation } from 'react-i18next';
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
      role: "HR Manager"
    },
    {
      id: "2",
      name: "Carlos Santos",
      email: "carlos.santos@techsolutions.com", 
      role: "Wellness Coordinator"
    }
  ]
};

const CompanySettings = () => {
  const { t } = useTranslation('company');
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
    role: ""
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
      companyToasts.actionFailed("adicionar campo – nome é obrigatório");
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
      companyToasts.actionFailed("adicionar contacto – nome e email são obrigatórios");
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
      role: ""
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
    
    companyToasts.settingsSaved();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {hasUnsavedChanges && <UnsavedChangesBanner onSave={handleSave} />}
      
      <div className="mx-auto max-w-4xl space-y-8"
           style={{ paddingTop: hasUnsavedChanges ? '3rem' : '0' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t('settings.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>
          
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {t('settings.save')}
          </Button>
        </div>

        {/* Company Information */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings.companyInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">{t('settings.companyInfo.name')}</Label>
                <Input
                  id="companyName"
                  value={settings.companyInfo.name}
                  onChange={(e) => updateSettings('companyInfo', { name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">{t('settings.companyInfo.website')}</Label>
                <Input
                  id="website"
                  value={settings.companyInfo.website}
                  onChange={(e) => updateSettings('companyInfo', { website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">{t('settings.companyInfo.contactEmail')}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.companyInfo.contactEmail}
                  onChange={(e) => updateSettings('companyInfo', { contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">{t('settings.companyInfo.phone')}</Label>
                <Input
                  id="contactPhone"
                  value={settings.companyInfo.contactPhone}
                  onChange={(e) => updateSettings('companyInfo', { contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">{t('settings.companyInfo.address')}</Label>
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
              {t('settings.quotaPolicies.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="defaultCompanySessions">{t('settings.quotaPolicies.defaultCompany')}</Label>
                <Input
                  id="defaultCompanySessions"
                  type="number"
                  value={settings.quotaPolicies.defaultCompanySessions}
                  onChange={(e) => updateSettings('quotaPolicies', { defaultCompanySessions: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="defaultPersonalSessions">{t('settings.quotaPolicies.defaultPersonal')}</Label>
                <Input
                  id="defaultPersonalSessions"
                  type="number"
                  value={settings.quotaPolicies.defaultPersonalSessions}
                  onChange={(e) => updateSettings('quotaPolicies', { defaultPersonalSessions: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="renewalPeriod">{t('settings.quotaPolicies.renewalPeriod')}</Label>
                <Select
                  value={settings.quotaPolicies.renewalPeriod}
                  onValueChange={(value: any) => updateSettings('quotaPolicies', { renewalPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border z-50">
                    <SelectItem value="monthly">{t('settings.renewalOptions.monthly')}</SelectItem>
                    <SelectItem value="quarterly">{t('settings.renewalOptions.quarterly')}</SelectItem>
                    <SelectItem value="yearly">{t('settings.renewalOptions.yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('settings.quotaPolicies.rollover')}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('settings.rolloverTooltip')}
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
              {t('settings.customFields.title')}
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
                          {t('settings.customFields.required')}
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
              <h4 className="font-medium mb-4">{t('settings.customFields.addNew')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="fieldName">{t('settings.customFields.fieldName')}</Label>
                  <Input
                    id="fieldName"
                    value={newCustomField.name}
                    onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
                    placeholder={t('settings.support.placeholder.name')}
                  />
                </div>
                <div>
                  <Label htmlFor="fieldType">{t('settings.customFields.type')}</Label>
                  <Select
                    value={newCustomField.type}
                    onValueChange={(value: any) => setNewCustomField({ ...newCustomField, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border z-50">
                      <SelectItem value="text">{t('settings.customFields.types.text')}</SelectItem>
                      <SelectItem value="select">{t('settings.customFields.types.select')}</SelectItem>
                      <SelectItem value="number">{t('settings.customFields.types.number')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newCustomField.required}
                      onCheckedChange={(checked) => setNewCustomField({ ...newCustomField, required: checked })}
                    />
                    <Label className="text-sm">{t('settings.customFields.required')}</Label>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addCustomField} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('settings.customFields.add')}
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
              {t('settings.support.title')}
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
              <h4 className="font-medium mb-4">{t('settings.support.add')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="contactName">{t('settings.support.name')}</Label>
                  <Input
                    id="contactName"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder={t('settings.support.placeholder.name')}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmailInput">{t('settings.support.email')}</Label>
                  <Input
                    id="contactEmailInput"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder={t('settings.support.placeholder.email')}
                  />
                </div>
                <div>
                  <Label htmlFor="contactRole">{t('settings.support.role')}</Label>
                  <Input
                    id="contactRole"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder={t('settings.support.placeholder.role')}
                  />
                </div>
              </div>
              <Button onClick={addSupportContact} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('settings.support.add')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettings;
