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
import { mockPrestadorSessions } from '@/data/prestadorMetrics';
import RuixenSection from '@/components/ui/ruixen-feature-section';

export default function PrestadorSessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState(mockPrestadorSessions);
  const [filteredSessions, setFilteredSessions] = useState(mockPrestadorSessions);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Filter sessions
  React.useEffect(() => {
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

      {/* Session Detail Modal - Full Screen */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Sessão</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Colaborador</label>
                  <p className="text-xl font-semibold mt-1">{selectedSession.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-xl font-semibold mt-1">{selectedSession.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div className="mt-2">
                    <Badge variant="outline" className="flex items-center gap-2 w-fit text-base py-2 px-3">
                      {selectedSession.type === 'Virtual' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      {selectedSession.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-2">
                    {getStatusBadge(selectedSession.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-lg mt-1">{new Date(selectedSession.date).toLocaleDateString('pt-PT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Avaliação</label>
                  {selectedSession.rating ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                      <span className="text-xl font-medium">{selectedSession.rating}/10</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">Não avaliado</p>
                  )}
                </div>
              </div>
              
              {selectedSession.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas</label>
                  <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p className="text-base">{selectedSession.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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