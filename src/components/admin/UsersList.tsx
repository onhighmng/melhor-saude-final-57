
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Users, UserMinus } from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface UsersListProps {
  users: AdminUser[];
  onUpdateSessions: (userId: string, sessions: number) => Promise<void>;
  onDeactivateUser: (userId: string) => Promise<void>;
}

const UsersList = ({ users, onUpdateSessions, onDeactivateUser }: UsersListProps) => {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<string | null>(null);

  const handleUpdateSessions = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      await onUpdateSessions(editingUser.id, newSessionCount);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating sessions:', error);
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

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setNewSessionCount(user.companySessions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Utilizadores Ativos ({users.length})
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
                <TableHead>Criado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company}</TableCell>
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
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar Sessões
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Sessões já utilizadas: {editingUser?.usedCompanySessions || 0}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button onClick={handleUpdateSessions} disabled={isUpdating}>
                                {isUpdating ? 'A Atualizar...' : 'Atualizar'}
                              </Button>
                              <Button variant="outline" onClick={() => setEditingUser(null)}>
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
                            {deactivatingUser === user.id ? 'A Desativar...' : 'Desativar Conta'}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
