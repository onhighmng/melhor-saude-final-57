import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, MessageSquare, Calendar, Star, Eye, FileText } from 'lucide-react';
import { mockUserHistory } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const EspecialistaUserHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const { filterByCompanyAccess } = useCompanyFilter();
  
  // Filter users by assigned companies
  const filteredUsers = filterByCompanyAccess(mockUserHistory);
  
  // Get unique companies for filter
  const companies = Array.from(new Set(filteredUsers.map(user => user.company_name)));

  const filteredBySearchAndCompany = filteredUsers.filter(user => {
    const matchesSearch = user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'all' || user.company_name === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const handleViewUserDetail = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

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

      {/* Filters */}
      <div className="w-full space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Procurar Utilizadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Procurar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {filteredBySearchAndCompany.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedCompany !== 'all' ? 'Nenhum utilizador encontrado' : 'Não há utilizadores disponíveis'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBySearchAndCompany.map((user) => (
              <Card key={user.user_id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewUserDetail(user)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{user.user_name}</h3>
                        <Badge variant="outline">{user.company_name}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{user.average_rating}/10</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{user.user_email}</p>
                        <p>Última atividade: {new Date(user.last_activity).toLocaleDateString('pt-PT')}</p>
                        <p>{user.total_chats} chats • {user.total_sessions} sessões</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* User Detail Modal */}
        <Dialog open={isUserDetailModalOpen} onOpenChange={setIsUserDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico Completo - {selectedUser?.user_name}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.user_email}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedUser.company_name}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Última Atividade</p>
                    <p className="font-medium">
                      {new Date(selectedUser.last_activity).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Avaliação Média</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{selectedUser.average_rating}/10</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                {selectedUser.internal_notes && selectedUser.internal_notes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Notas Internas</h4>
                    <div className="space-y-3">
                      {selectedUser.internal_notes.map((note: any) => (
                        <Card key={note.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {note.specialist_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(note.created_at).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ver Chats
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ver Sessões
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    Adicionar Nota
                  </Button>
                  <Button onClick={() => setIsUserDetailModalOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EspecialistaUserHistory;
