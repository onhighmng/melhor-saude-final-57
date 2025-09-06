import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Users, UserMinus, ChevronDown, Building2, UserCheck2, Filter } from 'lucide-react';
import { AdminUser, AdminPrestador, Company } from '@/types/admin';

interface OrganizedUsersListProps {
  companies: Company[];
  individualUsers: AdminUser[];
  prestadores: AdminPrestador[];
  onUpdateSessions: (userId: string, sessions: number) => Promise<void>;
  onDeactivateUser: (userId: string) => Promise<void>;
  getUsersByPrestador: (prestadorId: string) => Promise<AdminUser[]>;
  getPrestadorsByUser: (userId: string) => Promise<AdminPrestador[]>;
}

const OrganizedUsersList = ({ 
  companies, 
  individualUsers, 
  prestadores,
  onUpdateSessions, 
  onDeactivateUser,
  getUsersByPrestador,
  getPrestadorsByUser
}: OrganizedUsersListProps) => {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<string | null>(null);
  const [filterPrestadorId, setFilterPrestadorId] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [userPrestadors, setUserPrestadors] = useState<{[key: string]: AdminPrestador[]}>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setNewSessionCount(user.companySessions);
    setDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingUser(null);
    setDialogOpen(false);
  };

  const handleUpdateSessions = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      await onUpdateSessions(editingUser.id, newSessionCount);
      closeEditDialog();
      // Optional: Show success toast
      console.log(`Successfully updated sessions for ${editingUser.name} to ${newSessionCount}`);
    } catch (error) {
      console.error('Error updating sessions:', error);
      // Display the error to the user
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sessions';
      alert(`Error: ${errorMessage}`); // Replace with proper toast notification if available
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setDeactivatingUser(userId);
    try {
      await onDeactivateUser(userId);
    } catch (error) {
      console.error('Error deactivating user:', error);
    } finally {
      setDeactivatingUser(null);
    }
  };


  const handleFilterByPrestador = async (prestadorId: string) => {
    if (prestadorId) {
      const users = await getUsersByPrestador(prestadorId);
      setFilteredUsers(users);
      setShowFilter(true);
    }
  };

  const loadUserPrestadors = async (userId: string) => {
    if (!userPrestadors[userId]) {
      const prestadorsList = await getPrestadorsByUser(userId);
      setUserPrestadors(prev => ({ ...prev, [userId]: prestadorsList }));
    }
  };

  const UserRow = ({ user, isInCompany = false }: { user: AdminUser; isInCompany?: boolean }) => (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      {!isInCompany && <TableCell>{user.company || 'Particular'}</TableCell>}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {user.usedCompanySessions}/{user.companySessions}
          </span>
          <span className="text-xs text-gray-500">
            {user.companySessions - user.usedCompanySessions} restantes
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {user.bookingHistory.length > 0 ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadUserPrestadors(user.id)}
                className="p-0 h-auto font-normal text-left"
              >
                {user.bookingHistory.length} sessão(ões)
              </Button>
              {userPrestadors[user.id] && (
                <div className="text-xs text-gray-500 mt-1">
                  {userPrestadors[user.id].map(p => p.name).join(', ')}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Nenhuma sessão</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditDialog(user)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar Sessões
          </Button>
          
          <Dialog open={dialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
            if (!open) {
              closeEditDialog();
            }
          }}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Atualizar Sessões - {editingUser?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessions">Número de Sessões da Empresa</Label>
                  <Input
                    id="sessions"
                    type="number"
                    min="0"
                    value={newSessionCount}
                    onChange={(e) => setNewSessionCount(parseInt(e.target.value) || 0)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sessões já utilizadas: {editingUser?.usedCompanySessions || 0}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleUpdateSessions} disabled={isUpdating}>
                    {isUpdating ? 'A Atualizar...' : 'Atualizar'}
                  </Button>
                  <Button variant="outline" onClick={closeEditDialog}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                disabled={deactivatingUser === user.id}
              >
                <UserMinus className="w-3 h-3 mr-1" />
                {deactivatingUser === user.id ? 'A Desativar...' : 'Desativar'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desativar Conta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja desativar a conta de <strong>{user.name}</strong>?
                  <br /><br />
                  A conta será desativada mas não eliminada. Pode ser reativada a qualquer momento na secção "Contas Desativadas".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeactivateUser(user.id)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Desativar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );

  const totalUsers = companies.reduce((sum, company) => sum + company.users.length, 0) + individualUsers.length;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Correlações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="prestador-filter">Filtrar por Prestador</Label>
              <select
                id="prestador-filter"
                className="w-full p-2 border rounded-md"
                value={filterPrestadorId}
                onChange={(e) => {
                  setFilterPrestadorId(e.target.value);
                  if (e.target.value) {
                    handleFilterByPrestador(e.target.value);
                  } else {
                    setShowFilter(false);
                  }
                }}
              >
                <option value="">Selecionar Prestador</option>
                {prestadores.map(prestador => (
                  <option key={prestador.id} value={prestador.id}>
                    {prestador.name} ({prestador.totalBookings} sessões)
                  </option>
                ))}
              </select>
            </div>
            {showFilter && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowFilter(false);
                  setFilterPrestadorId('');
                }}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtered Results */}
      {showFilter && (
        <Card>
          <CardHeader>
            <CardTitle>
              Utilizadores que reservaram com {prestadores.find(p => p.id === filterPrestadorId)?.name} ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Sessões</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Histórico</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilizadores Ativos ({totalUsers})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Companies Section */}
            <AccordionItem value="companies">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Empresas ({companies.length})</span>
                  <Badge variant="secondary">
                    {companies.reduce((sum, company) => sum + company.users.length, 0)} utilizadores
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="multiple" className="pl-4">
                  {companies.map((company) => (
                    <AccordionItem key={company.name} value={company.name}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                          <span className="font-medium">{company.name}</span>
                          <Badge variant="outline">
                            {company.users.length} utilizadores
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Sessões</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Histórico</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {company.users.map((user) => (
                                <UserRow key={user.id} user={user} isInCompany={true} />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            {/* Individual Users Section */}
            <AccordionItem value="individuals">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <UserCheck2 className="w-4 h-4" />
                  <span>Particulares ({individualUsers.length})</span>
                  <Badge variant="secondary">
                    Contas individuais
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Sessões</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Histórico</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualUsers.map((user) => (
                        <UserRow key={user.id} user={user} isInCompany={true} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizedUsersList;