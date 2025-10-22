import React, { useState, useMemo } from 'react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Search, 
  Star,
  User,
  Building2,
  MessageSquare,
  Calendar,
  FileText,
  Plus,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserTimeline } from '@/components/specialist/UserTimeline';
import { mockUserHistory, mockInternalNotes } from '@/data/especialistaGeralMockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const EspecialistaUserHistoryRevamped = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Filtrar utilizadores por pesquisa
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return mockUserHistory;
    const term = searchTerm.toLowerCase();
    return mockUserHistory.filter(
      user =>
        user.user_name.toLowerCase().includes(term) ||
        user.user_email.toLowerCase().includes(term) ||
        user.company_name.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleViewUserDetail = (user: any) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: 'Nota Vazia',
        description: 'Por favor, escreva uma nota antes de guardar.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Nota Adicionada',
      description: 'A nota interna foi guardada com sucesso.',
    });

    setNewNote('');
  };

  const renderUserCard = (user: any) => {
    const lastActivity = new Date(user.last_activity);
    const hoursAgo = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60));

    return (
      <Card key={user.user_id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewUserDetail(user)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{user.user_name}</p>
                <p className="text-xs text-muted-foreground">{user.user_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{user.average_rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {user.company_name}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-blue-50 rounded">
              <p className="text-xs text-muted-foreground">Chats</p>
              <p className="text-lg font-bold text-blue-600">{user.total_chats}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded">
              <p className="text-xs text-muted-foreground">Sessões</p>
              <p className="text-lg font-bold text-purple-600">{user.total_sessions}</p>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="text-lg font-bold text-green-600">{user.average_rating}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <History className="h-3 w-3" />
            <span>Última atividade há {hoursAgo}h</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Criar timeline events do utilizador selecionado
  const getUserTimelineEvents = (user: any) => {
    if (!user) return [];
    
    const events: any[] = [];

    // Adicionar notas internas
    const userNotes = mockInternalNotes.filter(note => note.user_id === user.user_id);
    userNotes.forEach(note => {
      events.push({
        id: note.id,
        type: 'note',
        title: 'Nota Interna Adicionada',
        description: note.content,
        date: note.created_at,
        pillar: note.pillar,
        specialist: note.specialist_name,
        outcome: note.action_taken,
      });
    });

    return events;
  };

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">Histórico de Utilizadores</h1>
        <p className="text-muted-foreground">
          Ver histórico completo e adicionar notas internas sobre colaboradores
        </p>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 min-h-0">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          {/* Busca e Filtros */}
          <BentoCard
            name="🔍 Pesquisar Utilizadores"
            description="Encontre um colaborador por nome, email ou empresa"
            Icon={Search}
            className="col-span-3 row-span-1"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50" />
            }
            iconColor="text-gray-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
            href="#"
            cta=""
          >
            <div className="p-6 relative z-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {filteredUsers.length} utilizador{filteredUsers.length !== 1 && 'es'} encontrado{filteredUsers.length !== 1 && 's'}
              </p>
            </div>
          </BentoCard>

          {/* Lista de Utilizadores */}
          <BentoCard
            name="👥 Todos os Utilizadores"
            description={`${filteredUsers.length} colaboradores no sistema`}
            Icon={Users}
            className="col-span-3 row-span-2"
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
            }
            iconColor="text-indigo-600"
            textColor="text-gray-900"
            descriptionColor="text-indigo-600"
            href="#"
            cta=""
          >
            <div className="p-4 relative z-20">
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-gray-300 mb-2" />
                      <p className="text-muted-foreground">
                        Nenhum utilizador encontrado
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map(renderUserCard)
                  )}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>

      {/* User Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Detalhes do Utilizador
            </DialogTitle>
            <DialogDescription>
              Histórico completo e notas internas
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.user_name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.user_email}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-bold">{selectedUser.average_rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded">
                      <MessageSquare className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.total_chats}</p>
                      <p className="text-xs text-muted-foreground">Chats</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-purple-600">{selectedUser.total_sessions}</p>
                      <p className="text-xs text-muted-foreground">Sessões</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <Star className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-600">{selectedUser.average_rating}</p>
                      <p className="text-xs text-muted-foreground">Rating Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <UserTimeline events={getUserTimelineEvents(selectedUser)} />

              {/* Add New Note */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold">Adicionar Nota Interna</h3>
                  </div>
                  <Textarea
                    placeholder="Escreva observações sobre este utilizador (estas notas são confidenciais)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button onClick={handleAddNote} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Nota
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialistaUserHistoryRevamped;
