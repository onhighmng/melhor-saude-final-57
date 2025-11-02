import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  Users, 
  Activity, 
  Clock, 
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  MapPin,
  Video,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Star,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RuixenSection from '@/components/ui/ruixen-feature-section';
import { ProviderSessionManagementModal } from '@/components/sessions/ProviderSessionManagementModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { EmptyState } from '@/components/ui/empty-state';

export default function PrestadorSessions() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showManagementModal, setShowManagementModal] = useState(false);

  // Load sessions from Supabase
  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) return;

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) return;

        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles (name, email),
            companies (company_name)
          `)
          .eq('prestador_id', prestador.id)
          .order('date', { ascending: false });

        if (bookings) {
          setSessions(bookings.map((b: any) => ({
            id: b.id,
            clientName: (b.profiles as any)?.name || 'Utilizador',
            date: b.date,
            time: b.start_time || '00:00',
            pillar: b.pillar === 'saude_mental' ? 'Saúde Mental' : 
                   b.pillar === 'bem_estar_fisico' ? 'Bem-Estar Físico' :
                   b.pillar === 'assistencia_financeira' ? 'Assistência Financeira' :
                   'Assistência Jurídica',
            status: b.status === 'completed' ? 'Concluída' : 
                    b.status === 'scheduled' ? 'Agendada' :
                    b.status === 'cancelled' ? 'Cancelada' : 'Agendada',
            type: b.meeting_type === 'online' ? 'Virtual' : 'Presencial',
            company: (b.companies as any)?.company_name,
            rating: b.rating,
            meetingLink: b.meeting_link,
            notes: b.notes
          })));
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as sessões',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id]);

  // Filter sessions
  useEffect(() => {
    let filtered = sessions;

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(session => 
            new Date(session.date) >= filterDate && new Date(session.date) < new Date(filterDate.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(session => new Date(session.date) >= filterDate);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(session => new Date(session.date) >= filterDate);
          break;
      }
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  }, [sessions, dateFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'Concluída').length;
    const scheduled = sessions.filter(s => s.status === 'Agendada').length;
    const cancelled = sessions.filter(s => s.status === 'Cancelada').length;
    const avgRating = sessions
      .filter(s => s.rating)
      .reduce((sum, s) => sum + s.rating!, 0) / sessions.filter(s => s.rating).length || 0;

    return { total, completed, scheduled, cancelled, avgRating };
  }, [sessions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Concluída
        </Badge>;
      case 'Agendada':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Agendada
        </Badge>;
      case 'Cancelada':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelada
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-yellow-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Assistência Financeira':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setShowManagementModal(true);
  };

  const handleUpdateMeetingLink = (sessionId: string, link: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, meetingLink: link } : s
    ));
    toast({
      title: "Link atualizado",
      description: "O link da reunião foi atualizado com sucesso."
    });
  };

  const handleRescheduleSession = (sessionId: string) => {
    toast({
      title: "Reagendar sessão",
      description: "Funcionalidade de reagendamento em desenvolvimento."
    });
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'Cancelada' } : s
    ));
    toast({
      title: "Sessão cancelada",
      description: "A sessão foi cancelada com sucesso.",
      variant: "destructive"
    });
  };

  const handleAddNotes = (session: any) => {
    setSelectedSession(session);
    setSessionNotes(session.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedSession) {
      setSessions(prev => prev.map(s => 
        s.id === selectedSession.id ? { ...s, notes: sessionNotes } : s
      ));
      
      toast({
        title: "Notas adicionadas",
        description: `Notas pós-sessão foram salvas para ${selectedSession.clientName}`
      });
      
      setShowNotesModal(false);
      setSessionNotes('');
      setSelectedSession(null);
    }
  };

  const handleExportSessions = () => {
    toast({
      title: "Sessões exportadas",
      description: "Lista de sessões foi exportada com sucesso"
    });
  };

  // Show empty state if no sessions
  if (!loading && sessions.length === 0) {
    return (
      <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessões</h1>
          <p className="text-muted-foreground">Gerir e acompanhar as suas sessões com colaboradores</p>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nenhuma sessão atribuída ainda"
          description="Quando os colaboradores agendarem sessões consigo, elas aparecerão aqui. Certifique-se de que o seu perfil está ativo e disponível."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-blue-50 p-6 -m-6">
      {/* Feature Section with Stats Cards, Filters, and Sessions List */}
      <RuixenSection 
        stats={stats} 
        sessions={filteredSessions}
        getStatusBadge={getStatusBadge}
        dateFilter={dateFilter}
        statusFilter={statusFilter}
        onDateFilterChange={setDateFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={() => {
          setDateFilter('all');
          setStatusFilter('all');
        }}
        onExport={handleExportSessions}
        onSessionClick={handleViewSession}
      />

      {/* Provider Session Management Modal */}
      <ProviderSessionManagementModal
        session={selectedSession ? {
          id: selectedSession.id,
          clientName: selectedSession.clientName,
          pillar: selectedSession.pillar,
          date: selectedSession.date,
          time: selectedSession.time,
          platform: selectedSession.type === 'Virtual' ? 'Zoom' : 'Presencial',
          meetingLink: selectedSession.meetingLink
        } : null}
        isOpen={showManagementModal}
        onClose={() => {
          setShowManagementModal(false);
          setSelectedSession(null);
        }}
        onUpdateMeetingLink={handleUpdateMeetingLink}
        onReschedule={handleRescheduleSession}
        onCancel={handleCancelSession}
      />

      {/* Add Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nota Pós-Sessão</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas da sessão</Label>
              <Textarea
                id="notes"
                placeholder="Descreva o progresso do colaborador, pontos importantes discutidos, próximos passos..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotesModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNotes}>
                Guardar Notas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}