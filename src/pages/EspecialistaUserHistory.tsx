import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, MessageSquare, Calendar, Star } from 'lucide-react';
import { mockUserHistory } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const EspecialistaUserHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { filterByCompanyAccess } = useCompanyFilter();
  
  // Filter users by assigned companies
  const filteredUsers = filterByCompanyAccess(mockUserHistory);

  const filteredBySearch = filteredUsers.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Historial de Utilizadores
        </h1>
        <p className="text-muted-foreground mt-1">
          Ver histórico completo de utilizadores das empresas atribuídas
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Procurar Utilizadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Procurar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredBySearch.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Nenhum utilizador encontrado' : 'Não há utilizadores disponíveis'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBySearch.map((user) => (
            <Card key={user.user_id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{user.user_name}</h3>
                      <Badge variant="outline">{user.company_name}</Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{user.user_email}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Última Atividade</p>
                        <p className="font-medium">
                          {new Date(user.last_activity).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Chats</p>
                        <p className="font-medium">{user.total_chats}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Sessões</p>
                        <p className="font-medium">{user.total_sessions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Avaliação Média: {user.average_rating}/10
                      </span>
                    </div>

                    {/* Internal Notes */}
                    {user.internal_notes && user.internal_notes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Notas Internas</h4>
                        {user.internal_notes.map((note) => (
                          <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">
                                {note.specialist_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(note.created_at).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Ver Chats
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Ver Sessões
                      </Button>
                      <Button size="sm" variant="outline">
                        Adicionar Nota
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EspecialistaUserHistory;
