import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Star, FileText } from 'lucide-react';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const EspecialistaUserHistory = () => {
  const { profile } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserHistory = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        // Get chat sessions where this specialist actually handled a call
        const { data: callLogs } = await supabase
          .from('specialist_call_logs')
          .select('chat_session_id, user_id, created_at, call_notes')
          .eq('specialist_id', profile.id)
          .not('chat_session_id', 'is', null)
          .order('created_at', { ascending: false });

        if (!callLogs || callLogs.length === 0) {
          setFilteredUsers([]);
          setLoading(false);
          return;
        }

        // Get unique session IDs
        const sessionIds = [...new Set(callLogs.map(log => log.chat_session_id).filter(Boolean))];

        // Fetch sessions with user profile and company info in one query
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select(`
            id,
            user_id,
            pillar,
            status,
            created_at,
            satisfaction_rating,
            profiles!chat_sessions_user_id_fkey(
              name,
              email,
              company_id,
              companies!profiles_company_id_fkey(company_name)
            )
          `)
          .in('id', sessionIds);

        // Get chat messages for these sessions
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('session_id, role, content, created_at')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true });

        // Map to enriched sessions
        const enrichedSessions = (sessions || []).map((session: any) => {
          const userProfile = session.profiles;
          const sessionMessages = messages?.filter(m => m.session_id === session.id) || [];
          const callLog = callLogs.find(log => log.chat_session_id === session.id);

          return {
            ...session,
            user_name: userProfile?.name || 'Utilizador Desconhecido',
            user_email: userProfile?.email || 'Email não disponível',
            company_name: userProfile?.companies?.company_name || 'Empresa não disponível',
            pillar_attended: session.pillar,
            last_session_date: session.created_at,
            average_rating: session.satisfaction_rating === 'satisfied' ? 10 : (session.satisfaction_rating === 'unsatisfied' ? 3 : null),
            internal_notes: callLog?.call_notes ? [{ 
              id: callLog.chat_session_id, 
              content: callLog.call_notes,
              specialist_name: profile.full_name || 'Especialista',
              created_at: callLog.created_at
            }] : [],
            chat_history: sessionMessages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: m.created_at
            }))
          };
        });

        setFilteredUsers(enrichedSessions);
      } catch (error) {
        console.error('Error loading user history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserHistory();
  }, [profile?.id]);

  const handleViewChat = (user: any) => {
    setSelectedUser(user);
    setIsChatModalOpen(true);
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
      psychological: { bg: 'hsl(210 80% 95%)', text: 'hsl(210 80% 40%)' },
      physical: { bg: 'hsl(45 90% 90%)', text: 'hsl(45 90% 35%)' },
      financial: { bg: 'hsl(140 60% 95%)', text: 'hsl(140 60% 35%)' },
      legal: { bg: 'hsl(270 60% 95%)', text: 'hsl(270 60% 40%)' }
    };
    return colors[pillar as keyof typeof colors] || { bg: 'hsl(0 0% 95%)', text: 'hsl(0 0% 40%)' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Historial de Utilizadores
        </h1>
        <p className="text-muted-foreground mt-1">
          Lista de utilizadores já atendidos com histórico completo
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Pilar Atendido</TableHead>
              <TableHead>Data da Última Sessão</TableHead>
              <TableHead>Rating Médio</TableHead>
              <TableHead>Notas Internas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Sem utilizadores atendidos
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.user_name}</div>
                      <div className="text-xs text-muted-foreground">{user.company_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className="text-xs border-transparent" 
                      style={{ 
                        backgroundColor: getPillarColor(user.pillar_attended).bg, 
                        color: getPillarColor(user.pillar_attended).text 
                      }}
                    >
                      {getPillarLabel(user.pillar_attended)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.last_session_date).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell>
                    {user.average_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{user.average_rating}/10</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem avaliação</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      {user.internal_notes && user.internal_notes.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm line-clamp-2">
                            {user.internal_notes[0].content}
                          </p>
                          {user.internal_notes.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.internal_notes.length - 1} notas
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem notas</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewChat(user)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Ver chat anterior
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Chat History Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Histórico de Triagem e Pré-Diagnóstico - {selectedUser?.user_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <>
              <ScrollArea className="flex-1 pr-4 min-h-0">
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted rounded-lg">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedUser.user_email}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Empresa</p>
                      <p className="font-medium">{selectedUser.company_name}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Pilar</p>
                      <Badge 
                        className="text-xs border-transparent" 
                        style={{ 
                          backgroundColor: getPillarColor(selectedUser.pillar_attended).bg, 
                          color: getPillarColor(selectedUser.pillar_attended).text 
                        }}
                      >
                        {getPillarLabel(selectedUser.pillar_attended)}
                      </Badge>
                    </div>
                  </div>

                  {/* Chat History */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Histórico de Conversas
                    </h4>
                    <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                      <div className="space-y-4">
                        {selectedUser.chat_history && selectedUser.chat_history.length > 0 ? (
                          selectedUser.chat_history.map((message: any, index: number) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleString('pt-PT')}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Sem histórico de chat disponível
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="pb-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notas Internas do Especialista
                    </h4>
                    {selectedUser.internal_notes && selectedUser.internal_notes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.internal_notes.map((note: any) => (
                          <Card key={note.id}>
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium">{note.specialist_name}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(note.created_at).toLocaleDateString('pt-PT')}
                                </span>
                              </div>
                              <p className="text-sm">{note.content}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem notas internas disponíveis</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setIsChatModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialistaUserHistory;
