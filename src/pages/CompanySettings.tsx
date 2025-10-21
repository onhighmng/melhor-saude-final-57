import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard,
  Building2,
  Bell,
  Download,
  Mail,
  Phone,
  Settings,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Shield,
  AlertCircle
} from 'lucide-react';
import { mockContractInfo, mockInvoiceHistory } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";

const CompanySettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    usageAlerts: true,
    monthlyReports: true,
    criticalAlerts: true,
    sessionReminders: false,
    goalUpdates: true
  });

  const [companyProfile, setCompanyProfile] = useState({
    name: 'TechCorp Solutions',
    nuit: '123456789',
    contactEmail: 'hr@techcorp.com',
    contactPhone: '+351 912 345 678',
    hrContact: 'Ana Silva',
    hrEmail: 'ana.silva@techcorp.com'
  });

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download iniciado",
      description: `Fatura ${invoiceId} está a ser descarregada`
    });
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "As informações da empresa foram atualizadas com sucesso"
    });
  };

  const handleUpdateNotifications = () => {
    toast({
      title: "Notificações atualizadas",
      description: "As suas preferências de notificação foram salvas"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Em Atraso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações da Empresa</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o contrato, perfil da empresa e preferências de notificação
        </p>
      </div>

      <Tabs defaultValue="contract" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contract">Contrato & Faturação</TabsTrigger>
          <TabsTrigger value="profile">Perfil da Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        {/* Contract & Billing Tab */}
        <TabsContent value="contract" className="space-y-6">
          {/* Contract Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Plano Atual</p>
                      <p className="text-2xl font-bold text-blue-900">{mockContractInfo.planName}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Colaboradores:</span>
                      <span className="font-medium">{mockContractInfo.totalEmployees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sessões incluídas:</span>
                      <span className="font-medium">{mockContractInfo.sessionsIncluded}/mês</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tipo de plano:</span>
                      <Badge className="capitalize">{mockContractInfo.planType}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Valor Mensal</p>
                      <p className="text-2xl font-bold text-green-900">
                        {mockContractInfo.monthlyFee.toLocaleString()} {mockContractInfo.currency}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Próxima faturação:</span>
                      <span className="font-medium">{mockContractInfo.nextBillingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Início do contrato:</span>
                      <span className="font-medium">{mockContractInfo.contractStartDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fim do contrato:</span>
                      <span className="font-medium">{mockContractInfo.contractEndDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Faturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoiceHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{invoice.amount.toLocaleString()} MZN</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contacto Melhor Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">E-mail de Suporte</p>
                  <p className="text-sm text-muted-foreground">suporte@melhorsaude.co.mz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyProfile.name}
                    onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nuit">NUIT</Label>
                  <Input
                    id="nuit"
                    value={companyProfile.nuit}
                    onChange={(e) => setCompanyProfile({...companyProfile, nuit: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-mail de Contacto</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={companyProfile.contactEmail}
                    onChange={(e) => setCompanyProfile({...companyProfile, contactEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input
                    id="contactPhone"
                    value={companyProfile.contactPhone}
                    onChange={(e) => setCompanyProfile({...companyProfile, contactPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hrContact">Responsável RH</Label>
                  <Input
                    id="hrContact"
                    value={companyProfile.hrContact}
                    onChange={(e) => setCompanyProfile({...companyProfile, hrContact: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hrEmail">E-mail RH</Label>
                  <Input
                    id="hrEmail"
                    type="email"
                    value={companyProfile.hrEmail}
                    onChange={(e) => setCompanyProfile({...companyProfile, hrEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile}>
                  <Settings className="h-4 w-4 mr-2" />
                  Atualizar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de Utilização</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações quando atingir 90% das sessões
                    </p>
                  </div>
                  <Switch
                    checked={notifications.usageAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, usageAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios Mensais</Label>
                    <p className="text-sm text-muted-foreground">
                      Envio automático de relatórios mensais por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, monthlyReports: checked})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleUpdateNotifications}>
                  <Bell className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-start gap-3 p-4">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Privacidade e Proteção de Dados
                </p>
                <p className="text-sm text-muted-foreground">
                  Todas as notificações respeitam a privacidade dos colaboradores. Nunca são partilhados dados clínicos ou pessoais sensíveis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;
