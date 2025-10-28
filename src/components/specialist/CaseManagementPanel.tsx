import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSpecialistNotifications } from '@/hooks/useSpecialistNotifications';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  BellRing, 
  Users, 
  Calendar, 
  MessageCircle,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pillar, PILLAR_DISPLAY_NAMES } from '@/integrations/supabase/types-unified';

interface Case {
  id: string;
  type: 'escalated_chat' | 'session_request' | 'follow_up';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'forwarded';
  user_id: string;
  user_name: string;
  user_email: string;
  pillar: Pillar;
  title: string;
  description: string;
  chat_session_id?: string;
  booking_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  notes: string;
  resolution?: string;
  forwarded_to?: string;
  metadata: any;
}

interface CaseStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  forwarded: number;
  urgent: number;
}

export const CaseManagementPanel: React.FC = () => {
  const { t } = useTranslation('specialist');
  const { toast } = useToast();
  const { profile } = useAuth();
  const { notifications, stats: notificationStats } = useSpecialistNotifications();
  
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [caseStats, setCaseStats] = useState<CaseStats>({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    forwarded: 0,
    urgent: 0
  });
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [caseNotes, setCaseNotes] = useState('');
  const [caseResolution, setCaseResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Load escalated chats as cases
      const { data: escalatedChats, error: chatsError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          pillar,
          phone_escalation_reason,
          created_at,
          updated_at,
          profiles!chat_sessions_user_id_fkey(name, email)
        `)
        .eq('status', 'phone_escalated')
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Load pending bookings as cases
      const { data: pendingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          pillar,
          status,
          created_at,
          updated_at,
          profiles!bookings_user_id_fkey(name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Transform data into cases
      const chatCases: Case[] = (escalatedChats || []).map(chat => ({
        id: `chat_${chat.id}`,
        type: 'escalated_chat',
        priority: 'high',
        status: 'new',
        user_id: chat.user_id,
        user_name: chat.profiles?.name || 'Utilizador',
        user_email: chat.profiles?.email || '',
        pillar: chat.pillar as Pillar,
        title: 'Chat Escalado',
        description: chat.phone_escalation_reason || 'Chat escalado para especialista',
        chat_session_id: chat.id,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        notes: '',
        metadata: { escalation_reason: chat.phone_escalation_reason }
      }));

      const bookingCases: Case[] = (pendingBookings || []).map(booking => ({
        id: `booking_${booking.id}`,
        type: 'session_request',
        priority: 'normal',
        status: 'new',
        user_id: booking.user_id,
        user_name: booking.profiles?.name || 'Utilizador',
        user_email: booking.profiles?.email || '',
        pillar: booking.pillar as Pillar,
        title: 'Solicitação de Sessão',
        description: `Solicitação de sessão de ${PILLAR_DISPLAY_NAMES[booking.pillar as Pillar]}`,
        booking_id: booking.id,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        notes: '',
        metadata: { booking_status: booking.status }
      }));

      const allCases = [...chatCases, ...bookingCases]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setCases(allCases);

      // Calculate stats
      const stats: CaseStats = {
        total: allCases.length,
        new: allCases.filter(c => c.status === 'new').length,
        in_progress: allCases.filter(c => c.status === 'in_progress').length,
        resolved: allCases.filter(c => c.status === 'resolved').length,
        forwarded: allCases.filter(c => c.status === 'forwarded').length,
        urgent: allCases.filter(c => c.priority === 'urgent').length
      };

      setCaseStats(stats);

    } catch (error) {
      console.error('Error loading cases:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar casos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (caseId: string, status: Case['status'], resolution?: string) => {
    if (!profile?.id) return;

    setIsUpdating(true);
    try {
      const caseToUpdate = cases.find(c => c.id === caseId);
      if (!caseToUpdate) return;

      // Update case in local state
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { 
              ...c, 
              status, 
              resolution: resolution || c.resolution,
              updated_at: new Date().toISOString(),
              assigned_to: profile.id
            }
          : c
      ));

      // Update stats
      setCaseStats(prev => ({
        ...prev,
        [status]: prev[status] + 1,
        new: status !== 'new' ? prev.new - 1 : prev.new
      }));

      // Log the action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: profile.id,
          action: 'case_status_updated',
          entity_type: 'case',
          entity_id: caseId,
          details: {
            case_id: caseId,
            old_status: caseToUpdate.status,
            new_status: status,
            resolution,
            user_name: caseToUpdate.user_name
          }
        });

      toast({
        title: "Caso atualizado",
        description: `Status do caso atualizado para ${status}`
      });

      setIsCaseModalOpen(false);
      setSelectedCase(null);

    } catch (error) {
      console.error('Error updating case status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar caso",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addCaseNotes = async (caseId: string, notes: string) => {
    if (!profile?.id) return;

    try {
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, notes, updated_at: new Date().toISOString() }
          : c
      ));

      toast({
        title: "Notas adicionadas",
        description: "Notas do caso atualizadas"
      });
    } catch (error) {
      console.error('Error adding case notes:', error);
    }
  };

  const getStatusBadge = (status: Case['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Novo</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Edit className="h-3 w-3 mr-1" />Em Progresso</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case 'forwarded':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Encaminhado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Case['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Alta</Badge>;
      case 'normal':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Normal</Badge>;
      case 'low':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: Case['type']) => {
    switch (type) {
      case 'escalated_chat':
        return <MessageCircle className="h-4 w-4" />;
      case 'session_request':
        return <Calendar className="h-4 w-4" />;
      case 'follow_up':
        return <Phone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredCases = cases.filter(case => {
    const matchesSearch = case.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || case.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case.priority === priorityFilter;
    const matchesPillar = pillarFilter === 'all' || case.pillar === pillarFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesPillar;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestão de Casos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Casos</h2>
          <p className="text-muted-foreground">
            Gerir casos escalados e solicitações de sessões
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bell className="h-3 w-3" />
            {notificationStats.unread} notificações
          </Badge>
          <Button onClick={loadCases} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{caseStats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{caseStats.new}</p>
              <p className="text-sm text-muted-foreground">Novos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{caseStats.in_progress}</p>
              <p className="text-sm text-muted-foreground">Em Progresso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{caseStats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{caseStats.forwarded}</p>
              <p className="text-sm text-muted-foreground">Encaminhados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{caseStats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pesquisar por utilizador, título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-32">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                  <SelectItem value="forwarded">Encaminhados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-32">
              <Label htmlFor="priority-filter">Prioridade</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-32">
              <Label htmlFor="pillar-filter">Pilar</Label>
              <Select value={pillarFilter} onValueChange={setPillarFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                  <SelectItem value="bem_estar_fisico">Bem-estar Físico</SelectItem>
                  <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
                  <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground">
                    {getTypeIcon(caseItem.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{caseItem.title}</h3>
                      {getStatusBadge(caseItem.status)}
                      {getPriorityBadge(caseItem.priority)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {caseItem.user_name} • {PILLAR_DISPLAY_NAMES[caseItem.pillar]}
                    </p>
                    
                    <p className="text-sm">{caseItem.description}</p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em {new Date(caseItem.created_at).toLocaleDateString('pt-PT')}
                      {caseItem.updated_at !== caseItem.created_at && (
                        <span> • Atualizado em {new Date(caseItem.updated_at).toLocaleDateString('pt-PT')}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setCaseNotes(caseItem.notes);
                      setCaseResolution(caseItem.resolution || '');
                      setIsCaseModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCases.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum caso encontrado</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || pillarFilter !== 'all'
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Novos casos aparecerão aqui quando houver escalações'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Case Details Modal */}
      <Dialog open={isCaseModalOpen} onOpenChange={setIsCaseModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Caso</DialogTitle>
            <DialogDescription>
              Gerir caso de {selectedCase?.user_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6">
              {/* Case Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedCase.type)}
                  <h3 className="font-medium">{selectedCase.title}</h3>
                  {getStatusBadge(selectedCase.status)}
                  {getPriorityBadge(selectedCase.priority)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Utilizador</p>
                    <p className="text-muted-foreground">{selectedCase.user_name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Pilar</p>
                    <p className="text-muted-foreground">{PILLAR_DISPLAY_NAMES[selectedCase.pillar]}</p>
                  </div>
                  <div>
                    <p className="font-medium">Criado em</p>
                    <p className="text-muted-foreground">
                      {new Date(selectedCase.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Atualizado em</p>
                    <p className="text-muted-foreground">
                      {new Date(selectedCase.updated_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">Descrição</p>
                  <p className="text-muted-foreground">{selectedCase.description}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="case-notes">Notas do Caso</Label>
                <Textarea
                  id="case-notes"
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  placeholder="Adicione notas sobre este caso..."
                  rows={3}
                />
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <Label htmlFor="case-resolution">Resolução</Label>
                <Textarea
                  id="case-resolution"
                  value={caseResolution}
                  onChange={(e) => setCaseResolution(e.target.value)}
                  placeholder="Descreva como o caso foi resolvido..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCaseModalOpen(false)}>
                  Cancelar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => addCaseNotes(selectedCase.id, caseNotes)}
                >
                  Salvar Notas
                </Button>
                
                <Button
                  onClick={() => updateCaseStatus(selectedCase.id, 'in_progress')}
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Em Progresso
                </Button>
                
                <Button
                  onClick={() => updateCaseStatus(selectedCase.id, 'resolved', caseResolution)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolver
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => updateCaseStatus(selectedCase.id, 'forwarded', caseResolution)}
                  disabled={isUpdating}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Encaminhar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
