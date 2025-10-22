import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Star, FileText } from 'lucide-react';
import { mockUserHistory } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const EspecialistaUserHistory = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { filterByCompanyAccess } = useCompanyFilter();
  
  // Filter users by assigned companies
  const filteredUsers = filterByCompanyAccess(mockUserHistory);

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
      psychological: 'bg-blue-100 text-blue-700',
      physical: 'bg-green-100 text-green-700',
      financial: 'bg-purple-100 text-purple-700',
      legal: 'bg-orange-100 text-orange-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

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
                    <Badge className={`text-xs ${getPillarColor(user.pillar_attended)}`}>
                      {getPillarLabel(user.pillar_attended)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.last_session_date).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{user.average_rating}/10</span>
                    </div>
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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Histórico de Triagem e Pré-Diagnóstico - {selectedUser?.user_name}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
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
                  <Badge className={`text-xs ${getPillarColor(selectedUser.pillar_attended)}`}>
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
                <ScrollArea className="h-[300px] border rounded-lg p-4">
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
                </ScrollArea>
              </div>

              {/* Internal Notes */}
              {selectedUser.internal_notes && selectedUser.internal_notes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas Internas do Especialista
                  </h4>
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
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsChatModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialistaUserHistory;
