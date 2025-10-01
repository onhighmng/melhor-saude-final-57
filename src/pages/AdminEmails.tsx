import { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { OptimizedEmailTemplates } from "@/components/admin/OptimizedEmailTemplates";
import { 
  Mail, 
  Plus, 
  Edit, 
  Copy, 
  Download, 
  Send, 
  Save,
  Eye,
  Calendar,
  Bell,
  MessageCircle,
  RefreshCw,
  UserCheck,
  Clock
} from "lucide-react";

// Lazy load the preview component
const EmailPreview = lazy(() => import("@/components/admin/EmailPreview"));

interface EmailTemplate {
  id: string;
  name: string;
  event: string;
  subject: string;
  body: string;
  isActive: boolean;
  lastModified: string;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Confirmação de Sessão",
    event: "session_confirmation",
    subject: "Sessão confirmada - {session_date} com {provider_name}",
    body: "Olá {user_name},\n\nA sua sessão foi confirmada:\n\nData: {session_date}\nPrestador: {provider_name}\nPilar: {pillar}\n\nPode aceder ao link da sessão através do dashboard.\n\nObrigado,\nEquipa de Saúde",
    isActive: true,
    lastModified: "2024-01-15"
  },
  {
    id: "2", 
    name: "Lembrete 24h",
    event: "session_reminder",
    subject: "Lembrete: Sessão amanhã às {session_time}",
    body: "Olá {user_name},\n\nLembramos que tem uma sessão marcada para amanhã:\n\nData: {session_date}\nHora: {session_time}\nPrestador: {provider_name}\n\nNão se esqueça!\n\nCumprimentos,\nEquipa de Saúde",
    isActive: true,
    lastModified: "2024-01-12"
  },
  {
    id: "3",
    name: "Pedido de Feedback",
    event: "feedback_request", 
    subject: "Como correu a sua sessão com {provider_name}?",
    body: "Olá {user_name},\n\nEsperamos que a sua sessão tenha corrido bem!\n\nAjude-nos a melhorar avaliando:\n- Qualidade do atendimento\n- Pontualidade\n- Comunicação\n\nClique aqui para avaliar: {feedback_link}\n\nObrigado pelo seu tempo,\nEquipa de Saúde",
    isActive: true,
    lastModified: "2024-01-10"
  },
  {
    id: "4",
    name: "Decisão de Troca",
    event: "provider_change_decision",
    subject: "Resposta ao seu pedido de troca de prestador",
    body: "Olá {user_name},\n\nO seu pedido de troca de prestador foi {decision_status}.\n\n{decision_reason}\n\nNovo prestador: {new_provider_name}\nPróxima sessão: {next_session_date}\n\nSe tiver dúvidas, contacte-nos.\n\nCumprimentos,\nEquipa de Saúde",
    isActive: true,
    lastModified: "2024-01-08"
  },
  {
    id: "5",
    name: "Expiração de Bloqueio",
    event: "block_expiration",
    subject: "O seu bloqueio temporário expirou",
    body: "Olá {user_name},\n\nInformamos que o bloqueio temporário na sua conta expirou.\n\nJá pode voltar a marcar sessões normalmente através do dashboard.\n\nMotivo do bloqueio: {block_reason}\nData de expiração: {expiration_date}\n\nBem-vindo de volta!\nEquipa de Saúde",
    isActive: false,
    lastModified: "2024-01-05"
  },
  {
    id: "6",
    name: "Reagendamento",
    event: "session_reschedule",
    subject: "Sessão reagendada - Nova data: {new_session_date}",
    body: "Olá {user_name},\n\nA sua sessão foi reagendada:\n\nData anterior: {old_session_date}\nNova data: {new_session_date}\nPrestador: {provider_name}\nMotivo: {reschedule_reason}\n\nConfirme a nova data no dashboard.\n\nObrigado pela compreensão,\nEquipa de Saúde",
    isActive: true,
    lastModified: "2024-01-03"
  }
];

const eventTypes = [
  { value: "all", label: "Todos os Eventos", icon: Mail, color: "bg-gray-500" },
  { value: "session_confirmation", label: "Confirmação de Sessão", icon: UserCheck, color: "bg-green-500" },
  { value: "session_reminder", label: "Lembrete 24h", icon: Clock, color: "bg-blue-500" },
  { value: "feedback_request", label: "Pedido de Feedback", icon: MessageCircle, color: "bg-purple-500" },
  { value: "provider_change_decision", label: "Decisão de Troca", icon: RefreshCw, color: "bg-orange-500" },
  { value: "block_expiration", label: "Expiração de Bloqueio", icon: Bell, color: "bg-red-500" },
  { value: "session_reschedule", label: "Reagendamento", icon: Calendar, color: "bg-yellow-500" }
];

const placeholders = [
  "{user_name}", "{provider_name}", "{session_date}", "{session_time}", 
  "{pillar}", "{feedback_link}", "{decision_status}", "{decision_reason}",
  "{new_provider_name}", "{next_session_date}", "{block_reason}", 
  "{expiration_date}", "{old_session_date}", "{new_session_date}", "{reschedule_reason}"
];

const AdminEmails = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0]);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const filteredTemplates = useMemo(() => 
    templates.filter(template => 
      eventFilter === "all" || template.event === eventFilter
    ), [templates, eventFilter]
  );

  const getEventInfo = useMemo(() => (eventType: string) => {
    return eventTypes.find(et => et.value === eventType) || eventTypes[0];
  }, []);

  const handleSaveTemplate = () => {
    if (isNewTemplate) {
      const newTemplate: EmailTemplate = {
        ...selectedTemplate,
        id: Date.now().toString(),
        lastModified: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
      setIsNewTemplate(false);
    } else {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...selectedTemplate, lastModified: new Date().toISOString().split('T')[0] }
          : t
      ));
    }
    
    toast({
      title: "Template guardado",
      description: "As alterações foram guardadas com sucesso.",
    });
  };

  const handleDuplicateTemplate = () => {
    const duplicated: EmailTemplate = {
      ...selectedTemplate,
      id: Date.now().toString(),
      name: `${selectedTemplate.name} (Cópia)`,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, duplicated]);
    
    toast({
      title: "Template duplicado",
      description: "Uma cópia do template foi criada.",
    });
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast({
        title: "Email necessário",
        description: "Introduza um email para enviar o teste.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send a test email
    console.log("Sending test email to:", testEmail);
    
    toast({
      title: "Teste enviado",
      description: `Email de teste enviado para ${testEmail}`,
    });
    
    setTestEmail("");
  };

  const handleExportTemplate = () => {
    const exportData = JSON.stringify(selectedTemplate, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, "_")}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template exportado",
      description: "O ficheiro JSON foi descarregado.",
    });
  };

  const createNewTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: "new",
      name: "Novo Template",
      event: "session_confirmation",
      subject: "",
      body: "",
      isActive: true,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setSelectedTemplate(newTemplate);
    setIsNewTemplate(true);
  };

  const insertPlaceholder = (placeholder: string) => {
    setSelectedTemplate({
      ...selectedTemplate,
      body: selectedTemplate.body + placeholder
    });
  };

  const generatePreview = (template: EmailTemplate) => {
    const previewData = {
      "{user_name}": "João Silva",
      "{provider_name}": "Dr. Ana Costa",
      "{session_date}": "15 de Janeiro de 2024",
      "{session_time}": "14:00",
      "{pillar}": "Saúde Mental",
      "{feedback_link}": "https://plataforma.com/feedback/123",
      "{decision_status}": "aprovado",
      "{decision_reason}": "Encontrámos um prestador mais adequado ao seu perfil.",
      "{new_provider_name}": "Dr. Pedro Santos",
      "{next_session_date}": "20 de Janeiro de 2024",
      "{block_reason}": "Múltiplas faltas sem aviso",
      "{expiration_date}": "18 de Janeiro de 2024",
      "{old_session_date}": "15 de Janeiro de 2024",
      "{new_session_date}": "18 de Janeiro de 2024",
      "{reschedule_reason}": "Indisponibilidade do prestador"
    };

    let previewSubject = template.subject;
    let previewBody = template.body;

    Object.entries(previewData).forEach(([placeholder, value]) => {
      previewSubject = previewSubject.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      previewBody = previewBody.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    return { subject: previewSubject, body: previewBody };
  };

  const preview = generatePreview(selectedTemplate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestão de Emails & Templates
            </h1>
            <p className="text-muted-foreground">
              Configure templates de email organizados por evento da plataforma
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((event) => {
                  const IconComponent = event.icon;
                  return (
                    <SelectItem key={event.value} value={event.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {event.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button onClick={createNewTemplate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Templates List */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Templates ({filteredTemplates.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Ainda não existem templates para este evento
                    </p>
                  </div>
                ) : (
                  <OptimizedEmailTemplates
                    templates={filteredTemplates}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={(template) => {
                      setSelectedTemplate(template);
                      setIsNewTemplate(false);
                    }}
                    getEventInfo={getEventInfo}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        {isNewTemplate ? "Novo Template" : `Editar: ${selectedTemplate?.name}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDuplicateTemplate}
                          disabled={isNewTemplate}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportTemplate}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveTemplate}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="templateName">Nome do Template</Label>
                        <Input
                          id="templateName"
                          value={selectedTemplate?.name || ""}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate!,
                            name: e.target.value
                          })}
                          placeholder="Nome do template..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventType">Evento</Label>
                        <Select
                          value={selectedTemplate?.event || ""}
                          onValueChange={(value) => setSelectedTemplate({
                            ...selectedTemplate!,
                            event: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar evento" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.slice(1).map((event) => {
                              const IconComponent = event.icon;
                              return (
                                <SelectItem key={event.value} value={event.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {event.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate?.subject || ""}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          subject: e.target.value
                        })}
                        placeholder="Assunto do email..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="body">Corpo do Email</Label>
                      <Textarea
                        id="body"
                        value={selectedTemplate?.body || ""}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          body: e.target.value
                        })}
                        placeholder="Conteúdo do email..."
                        rows={12}
                      />
                    </div>

                    <div>
                      <Label>Placeholders Disponíveis</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {placeholders.map((placeholder) => (
                          <Button
                            key={placeholder}
                            size="sm"
                            variant="outline"
                            onClick={() => insertPlaceholder(placeholder)}
                            className="text-xs h-7"
                          >
                            {placeholder}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <Label htmlFor="testEmail">Enviar Email de Teste</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="testEmail"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendTest}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Enviar Teste
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }>
                  <EmailPreview template={selectedTemplate!} preview={preview} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmails;