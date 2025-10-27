import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AdminSupportTicketsTab() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          id,
          title,
          status,
          created_at,
          company_id,
          company:companies(company_name)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      const { data: messagesData, error: messagesError } = await supabase
        .from('support_messages')
        .select(`
          id,
          ticket_id,
          sender_id,
          sender_type,
          content,
          created_at,
          sender:profiles(name)
        `)
        .in('ticket_id', ticketsData?.map(t => t.id) || [])
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const ticketsWithMessages: Ticket[] = (ticketsData || []).map(ticket => {
        const ticketMessages = messagesData?.filter(m => m.ticket_id === ticket.id) || [];
        
        const calculateAvgResponseTime = () => {
          if (ticketMessages.length < 2) return 0;
          
          const adminMessages = ticketMessages.filter(m => m.sender_type === 'admin');
          if (adminMessages.length === 0) return 0;
          
          const firstAdminMessage = adminMessages[0];
          const timeDiff = new Date(firstAdminMessage.created_at).getTime() - new Date(ticket.created_at).getTime();
          return Math.round(timeDiff / (1000 * 60)); // minutes
        };

        const avgResponseTime = calculateAvgResponseTime();

        return {
          id: ticket.id,
          title: ticket.title,
          company: ticket.company?.company_name || 'N/A',
          status: ticket.status as 'aberto' | 'em_resolucao' | 'resolvido',
          createdAt: ticket.created_at,
          avgResponseTime,
          messages: ticketMessages.map(msg => ({
            id: msg.id,
            sender: (msg.sender as any)?.name || 'Unknown',
            senderType: msg.sender_type as 'user' | 'admin',
            content: msg.content,
            timestamp: msg.created_at
          }))
        };
      });

      setTickets(ticketsWithMessages);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'Erro ao carregar tickets',
        description: 'Não foi possível carregar os tickets de suporte.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim() || !profile?.id) return;

    try {
      // Insert message into database
      const { data: messageData, error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: profile.id,
          sender_type: 'admin',
          content: newMessage
        })
        .select(`
          *,
          sender:profiles(name)
        `)
        .single();

      if (messageError) throw messageError;

      // Update ticket status if it's open
      if (selectedTicket.status === 'aberto') {
        await supabase
          .from('support_tickets')
          .update({ status: 'em_resolucao' })
          .eq('id', selectedTicket.id);
      }

      // Refresh tickets
      await loadTickets();

      // Update selected ticket
      const updatedMessages = [...selectedTicket.messages, {
        id: messageData.id,
        sender: (messageData.sender as any)?.name || 'Suporte',
        senderType: 'admin' as const,
        content: newMessage,
        timestamp: messageData.created_at
      }];

      setSelectedTicket({
        ...selectedTicket,
        messages: updatedMessages,
        status: selectedTicket.status === 'aberto' ? 'em_resolucao' : selectedTicket.status
      });

      setNewMessage('');
      
      toast({
        title: 'Mensagem enviada',
        description: 'A sua mensagem foi enviada com sucesso.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      );
      setTickets(updatedTickets);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }

      toast({
        title: 'Status atualizado',
        description: 'O status do ticket foi atualizado.',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do ticket.',
        variant: 'destructive'
      });
    }
  };

  const stats = {
    total: tickets.length,
    aberto: tickets.filter((t) => t.status === 'aberto').length,
    em_resolucao: tickets.filter((t) => t.status === 'em_resolucao').length,
    resolvido: tickets.filter((t) => t.status === 'resolvido').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium animate-pulse bg-gray-200 h-4 w-24 rounded" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-pulse bg-gray-200 h-8 w-16 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
