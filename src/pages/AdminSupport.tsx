import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportMessage {
  id: string;
  from: 'user' | 'admin';
  content: string;
  timestamp: Date;
  attachments?: Array<{ name: string; url: string }>;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'chat' | 'form';
  user: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  subject: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  assignedTo?: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: "AS-2025-000123",
    title: "Problema com agendamento",
    status: "open",
    priority: "high",
    source: "form",
    user: {
      name: "Maria Silva",
      email: "maria.silva@empresa.pt",
      phone: "+351 912 345 678"
    },
    subject: "Agendamento",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messages: [
      {
        id: "1",
        from: "user",
        content: "Não consigo agendar uma sessão. O sistema dá erro quando seleciono a data.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: "AS-2025-000124",
    title: "Questão sobre conta",
    status: "in_progress",
    priority: "medium",
    source: "chat",
    user: {
      name: "João Santos",
      email: "joao.santos@exemplo.pt"
    },
    subject: "Acesso/Conta",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    messages: [
      {
        id: "1",
        from: "user",
        content: "Como posso alterar a minha palavra-passe?",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: "2",
        from: "admin",
        content: "Olá João! Pode alterar a palavra-passe nas definições da conta. Vou enviar-lhe as instruções detalhadas por email.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      }
    ],
    assignedTo: "Admin"
  },
  {
    id: "AS-2025-000125",
    title: "Dúvida sobre sessões",
    status: "resolved",
    priority: "low",
    source: "chat",
    user: {
      name: "Ana Costa",
      email: "ana.costa@teste.pt"
    },
    subject: "Outros",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    messages: [
      {
        id: "1",
        from: "user",
        content: "Quantas sessões tenho disponíveis este mês?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: "2",
        from: "admin",
        content: "Tem 3 sessões disponíveis este mês. Pode consultar o saldo na sua dashboard.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],
    assignedTo: "Admin"
  }
];

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: SupportMessage = {
      id: Date.now().toString(),
      from: 'admin',
      content: newMessage,
      timestamp: new Date()
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: new Date(),
      status: selectedTicket.status === 'open' ? 'in_progress' as const : selectedTicket.status
    };

    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage("");
    
    toast({
      title: "Mensagem enviada",
      description: "A resposta foi enviada ao utilizador."
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, status: newStatus as any, updatedAt: new Date() }
        : t
    ));
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any, updatedAt: new Date() } : null);
    }

    toast({
      title: "Estado atualizado",
      description: `Ticket marcado como ${newStatus}.`
    });
  };

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const inProgressTicketsCount = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-['Baskervville'] text-3xl md:text-4xl font-semibold text-foreground mb-2">
          Gestão de Suporte
        </h1>
        <p className="font-['Noto_Serif'] text-sm md:text-base text-black/60">
          Gerir tickets e responder a utilizadores
        </p>
        
        <div className="flex gap-4 mt-4">
          <Card className="flex-1">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{openTicketsCount}</p>
                <p className="text-sm text-muted-foreground">Tickets Abertos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressTicketsCount}</p>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Tickets de Suporte
              </CardTitle>
              
              {/* Filters */}
              <div className="space-y-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em progresso</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredTickets.map((ticket) => (
                    <Card 
                      key={ticket.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-muted-foreground">
                              {ticket.id}
                            </span>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-sm">{ticket.title}</h3>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              {ticket.user.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">{ticket.status}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {ticket.updatedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedTicket.title}
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTicket.id} • {selectedTicket.user.name} • {selectedTicket.user.email}
                    </p>
                  </div>
                  
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em progresso</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Messages */}
                <ScrollArea className="h-[400px] mb-4">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] space-y-2`}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {message.from === 'admin' ? 'A' : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {message.from === 'admin' ? 'Admin' : selectedTicket.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className={`p-3 rounded-lg ${
                            message.from === 'admin' 
                              ? 'bg-primary text-primary-foreground ml-8' 
                              : 'bg-muted mr-8'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Reply Form */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escreva a sua resposta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Selecione um ticket</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um ticket da lista para ver os detalhes e responder
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}