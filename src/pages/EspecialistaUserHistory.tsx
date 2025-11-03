import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Star, FileText, Calendar, Phone } from 'lucide-react';
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
        // Get prestador ID for this specialist
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          console.log('[EspecialistaUserHistory] No prestador found');
          setFilteredUsers([]);
          setLoading(false);
          return;
        }

        // 1. Get users from bookings (sessions)
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            user_id,
            booking_date,
            start_time,
            status,
            pillar,
            session_type,
            meeting_link,
            rating,
            profiles!bookings_user_id_fkey(name, email, company_id, companies!profiles_company_id_fkey(company_name))
          `)
          .eq('prestador_id', prestador.id)
          .not('user_id', 'is', null);

        // 2. Get users from call logs
        const { data: callLogs } = await supabase
          .from('specialist_call_logs')
          .select(`
            user_id,
            created_at,
            call_notes,
            outcome,
            chat_session_id
          `)
          .eq('specialist_id', profile.id)
          .not('user_id', 'is', null);

        // 3. Get users from escalated chats
        const { data: chatSessions } = await supabase
          .from('chat_sessions')
          .select(`
            id,
            user_id,
            pillar,
            status,
            created_at,
            satisfaction_rating
          `)
          .eq('status', 'phone_escalated')
          .not('user_id', 'is', null);

        // Get unique user IDs from all sources
        const userIds = new Set<string>();
        bookings?.forEach(b => b.user_id && userIds.add(b.user_id));
        callLogs?.forEach(c => c.user_id && userIds.add(c.user_id));
        chatSessions?.forEach(s => s.user_id && userIds.add(s.user_id));

        if (userIds.size === 0) {
          setFilteredUsers([]);
          setLoading(false);
          return;
        }

        // Fetch user profiles for all unique users
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            company_id,
            companies!profiles_company_id_fkey(company_name)
          `)
          .in('id', Array.from(userIds));

        // Get chat messages for escalated sessions
        const chatSessionIds = chatSessions?.map(s => s.id).filter(Boolean) || [];
        const { data: messages } = chatSessionIds.length > 0 ? await supabase
          .from('chat_messages')
          .select('session_id, role, content, created_at')
          .in('session_id', chatSessionIds)
          .order('created_at', { ascending: true }) : { data: [] };

        // Build enriched user data
        const enrichedUsers = (userProfiles || []).map((userProfile: any) => {
          // Get all interactions for this user
          const userBookings = bookings?.filter(b => b.user_id === userProfile.id) || [];
          const userCallLogs = callLogs?.filter(c => c.user_id === userProfile.id) || [];
          const userChatSessions = chatSessions?.filter(s => s.user_id === userProfile.id) || [];

          // Get most recent interaction date
          const dates = [
            ...userBookings.map(b => new Date(b.booking_date)),
            ...userCallLogs.map(c => new Date(c.created_at)),
            ...userChatSessions.map(s => new Date(s.created_at))
          ].sort((a, b) => b.getTime() - a.getTime());
          const lastInteractionDate = dates[0]?.toISOString() || new Date().toISOString();

          // Determine primary pillar (most common)
          const pillarCounts: Record<string, number> = {};
          [...userBookings, ...userChatSessions].forEach(item => {
            if (item.pillar) {
              pillarCounts[item.pillar] = (pillarCounts[item.pillar] || 0) + 1;
            }
          });
          const primaryPillar = Object.entries(pillarCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'psychological';

          // Calculate average rating from bookings
          const ratingsFromBookings = userBookings.filter(b => b.rating).map(b => b.rating);
          const avgRating = ratingsFromBookings.length > 0 
            ? Math.round(ratingsFromBookings.reduce((sum, r) => sum + r, 0) / ratingsFromBookings.length)
            : null;

          // Build notes from call logs
          const internalNotes = userCallLogs
            .filter(log => log.call_notes)
            .map(log => ({
              id: `call-${log.chat_session_id || Date.now()}`,
              content: log.call_notes,
              specialist_name: profile.full_name || 'Especialista',
              created_at: log.created_at,
              type: 'call'
            }));

          // Build chat history for escalated sessions
          const chatHistory = userChatSessions.flatMap(session => {
            const sessionMessages = messages?.filter(m => m.session_id === session.id) || [];
            return sessionMessages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: m.created_at,
              session_id: session.id
            }));
          });

          // Build sessions list with details
          const sessionsList = userBookings.map(booking => ({
            id: booking.user_id,
            date: booking.booking_date,
            time: booking.start_time,
            status: booking.status,
            pillar: booking.pillar,
            type: booking.session_type,
            rating: booking.rating
          }));

          // Build calls list
          const callsList = userCallLogs.map(call => ({
            id: call.chat_session_id || `call-${call.created_at}`,
            date: call.created_at,
            outcome: call.outcome,
            notes: call.call_notes
          }));

          return {
            user_id: userProfile.id,
            user_name: userProfile.name || 'Utilizador Desconhecido',
            user_email: userProfile.email || 'Email não disponível',
            company_name: userProfile.companies?.company_name || 'Empresa não disponível',
            pillar_attended: primaryPillar,
            last_session_date: lastInteractionDate,
            average_rating: avgRating,
            internal_notes: internalNotes,
            chat_history: chatHistory,
            sessions_list: sessionsList,
            calls_list: callsList,
            total_sessions: userBookings.length,
            total_calls: userCallLogs.length,
            total_chats: userChatSessions.length
          };
        }).sort((a, b) => new Date(b.last_session_date).getTime() - new Date(a.last_session_date).getTime());

        setFilteredUsers(enrichedUsers);
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

      {/* User History Modal with Tabs */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Histórico do Utilizador - {selectedUser?.user_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <>
              {/* User Info */}
              <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.user_email}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Empresa</p>
                  <p className="font-medium">{selectedUser.company_name}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Pilar Principal</p>
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
                <div className="text-sm">
                  <p className="text-muted-foreground">Total Interações</p>
                  <p className="font-medium">
                    {selectedUser.total_sessions} sessões • {selectedUser.total_calls} chamadas • {selectedUser.total_chats} chats
                  </p>
                </div>
              </div>

              <Tabs defaultValue="sessions" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sessions">
                    <Calendar className="h-4 w-4 mr-2" />
                    Sessões ({selectedUser.total_sessions})
                  </TabsTrigger>
                  <TabsTrigger value="calls">
                    <Phone className="h-4 w-4 mr-2" />
                    Chamadas ({selectedUser.total_calls})
                  </TabsTrigger>
                  <TabsTrigger value="chats">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chats Escalados ({selectedUser.total_chats})
                  </TabsTrigger>
                </TabsList>

                {/* Sessions Tab */}
                <TabsContent value="sessions" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[400px] pr-4">
                    {selectedUser.sessions_list && selectedUser.sessions_list.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.sessions_list.map((session: any, index: number) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{new Date(session.date).toLocaleDateString('pt-PT')}</span>
                                  <span className="text-muted-foreground">às {session.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{session.type || 'Individual'}</Badge>
                                  <Badge 
                                    className="text-xs border-transparent" 
                                    style={{ 
                                      backgroundColor: getPillarColor(session.pillar).bg, 
                                      color: getPillarColor(session.pillar).text 
                                    }}
                                  >
                                    {getPillarLabel(session.pillar)}
                                  </Badge>
                                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                    {session.status}
                                  </Badge>
                                </div>
                              </div>
                              {session.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{session.rating}/10</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem sessões registadas</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Calls Tab */}
                <TabsContent value="calls" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[400px] pr-4">
                    {selectedUser.calls_list && selectedUser.calls_list.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.calls_list.map((call: any, index: number) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{new Date(call.date).toLocaleString('pt-PT')}</span>
                                {call.outcome && (
                                  <Badge variant="secondary">{call.outcome}</Badge>
                                )}
                              </div>
                              {call.notes && (
                                <div className="bg-muted p-3 rounded text-sm">
                                  <p className="font-medium text-xs text-muted-foreground mb-1">Notas:</p>
                                  <p>{call.notes}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem chamadas registadas</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* Chats Tab */}
                <TabsContent value="chats" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[400px] pr-4">
                    {selectedUser.chat_history && selectedUser.chat_history.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUser.chat_history.map((message: any, index: number) => (
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem chats escalados</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>

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
