import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Building2, Calendar, Send, Search } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatting';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'admin';
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  title: string;
  company: string;
  status: 'aberto' | 'em_resolucao' | 'resolvido';
  createdAt: string;
  avgResponseTime: number; // in minutes
  messages: Message[];
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Problema com acesso ao sistema',
    company: 'Tech Solutions Lda',
    status: 'aberto',
    createdAt: '2024-01-15T10:30:00Z',
    avgResponseTime: 45,
    messages: [
      {
        id: 'm1',
        sender: 'João Silva',
        senderType: 'user',
        content: 'Não consigo aceder ao sistema desde ontem.',
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Solicitação de relatório customizado',
    company: 'Consulting Partners',
    status: 'em_resolucao',
    createdAt: '2024-01-14T14:20:00Z',
    avgResponseTime: 120,
    messages: [
      {
        id: 'm2',
        sender: 'Maria Costa',
        senderType: 'user',
        content: 'Gostaria de um relatório mensal personalizado.',
        timestamp: '2024-01-14T14:20:00Z',
      },
      {
        id: 'm3',
        sender: 'Suporte',
        senderType: 'admin',
        content: 'Estamos a trabalhar no seu pedido. Terá resposta em breve.',
        timestamp: '2024-01-14T15:00:00Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Dúvida sobre faturação',
    company: 'Wellness Corp',
    status: 'resolvido',
    createdAt: '2024-01-10T09:15:00Z',
    avgResponseTime: 30,
    messages: [
      {
        id: 'm4',
        sender: 'Pedro Santos',
        senderType: 'user',
        content: 'Tenho uma dúvida sobre a última fatura.',
        timestamp: '2024-01-10T09:15:00Z',
      },
      {
        id: 'm5',
        sender: 'Suporte',
        senderType: 'admin',
        content: 'A fatura está correta. Reflete as sessões utilizadas no mês anterior.',
        timestamp: '2024-01-10T09:45:00Z',
      },
    ],
  },
];

export default function AdminSupportTicketsTab() {
  const { t } = useTranslation('admin');
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return 'destructive';
      case 'em_resolucao':
        return 'default';
      case 'resolvido':
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return 'Aberto';
      case 'em_resolucao':
        return 'Em Resolução';
      case 'resolvido':
        return 'Resolvido';
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const message: Message = {
      id: `m${Date.now()}`,
      sender: 'Suporte',
      senderType: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            messages: [...ticket.messages, message],
            status: ticket.status === 'aberto' ? ('em_resolucao' as const) : ticket.status,
          }
        : ticket
    );

    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
    });
    setNewMessage('');
  };

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    );
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const stats = {
    total: tickets.length,
    aberto: tickets.filter((t) => t.status === 'aberto').length,
    em_resolucao: tickets.filter((t) => t.status === 'em_resolucao').length,
    resolvido: tickets.filter((t) => t.status === 'resolvido').length,
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.aberto}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_resolucao}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.resolvido}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets de Suporte</CardTitle>
              <CardDescription>Gerir e responder a tickets de clientes</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar tickets..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_resolucao">Em Resolução</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tempo Médio Resposta</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {ticket.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(ticket.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {ticket.avgResponseTime}min
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTicket.title}</SheetTitle>
                <SheetDescription>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedTicket.company}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(selectedTicket.status)}>
                        {getStatusLabel(selectedTicket.status)}
                      </Badge>
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Histórico de Mensagens</h3>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value as Ticket['status'])}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_resolucao">Em Resolução</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.senderType === 'admin' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Nova Mensagem</label>
                  <Textarea
                    placeholder="Escreva a sua resposta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
