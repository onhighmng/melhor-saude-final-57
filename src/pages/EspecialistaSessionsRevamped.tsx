import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Phone, Calendar as CalendarIcon, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockEspecialistaSessions } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { SessionNoteModal } from '@/components/specialist/SessionNoteModal';

const EspecialistaSessionsRevamped = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const allSessions = filterByCompanyAccess(mockEspecialistaSessions);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separate future and past sessions
  const futureSessions = useMemo(() => {
    return allSessions
      .filter(s => new Date(s.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allSessions, today]);

  const pastSessions = useMemo(() => {
    return allSessions
      .filter(s => new Date(s.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allSessions, today]);

  const handleStartSession = (session: any) => {
    toast({
      title: 'Sessão Iniciada',
      description: `Sessão com ${session.user_name} iniciada.`,
    });
  };

  const handleEndSession = (session: any) => {
    setSelectedSession(session);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (notes: string, outcome: string) => {
    toast({
      title: 'Nota Guardada',
      description: `Nota interna guardada. Resultado: ${outcome}`,
    });
    setIsNoteModalOpen(false);
  };

  const handleAddNote = (session: any) => {
    setSelectedSession(session);
    setIsNoteModalOpen(true);
  };

  const getPillarLabel = (pillar: string) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  const getPillarColor = (pillar: string) => {
    const colors = {
      psychological: 'bg-blue-100 text-blue-700',
      physical: 'bg-green-100 text-green-700',
      financial: 'bg-purple-100 text-purple-700',
      legal: 'bg-orange-100 text-orange-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return {
      variant: variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const getSessionTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />;
  };

  const getSessionTypeLabel = (type: string) => {
    return type === 'video' ? 'Vídeo' : 'Chamada';
  };

  const renderSessionTable = (sessions: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data & Hora</TableHead>
          <TableHead>Colaborador</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Pilar</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
              Sem sessões
            </TableCell>
          </TableRow>
        ) : (
          sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="flex flex-col">
                  <div className="font-medium flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(session.date).toLocaleDateString('pt-PT')}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.time}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{session.user_name}</div>
              </TableCell>
              <TableCell>{session.company_name}</TableCell>
              <TableCell>
                <Badge className={`text-xs ${getPillarColor(session.pillar)}`}>
                  {getPillarLabel(session.pillar)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getSessionTypeIcon(session.session_type || 'video')}
                  <span className="text-sm">{getSessionTypeLabel(session.session_type || 'video')}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`text-xs ${getStatusBadge(session.status).variant}`}>
                  {getStatusBadge(session.status).label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddNote(session)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Notas
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Calendário Pessoal
        </h1>
        <p className="text-muted-foreground mt-1">
          Sessões futuras e passadas com tipo e estado
        </p>
      </div>

      <Card>
        <Tabs defaultValue="future" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger 
              value="future" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Sessões Futuras ({futureSessions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Sessões Passadas ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="future" className="mt-0">
            {renderSessionTable(futureSessions)}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {renderSessionTable(pastSessions)}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Session Note Modal */}
      {selectedSession && (
        <SessionNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          session={selectedSession}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
};

export default EspecialistaSessionsRevamped;
