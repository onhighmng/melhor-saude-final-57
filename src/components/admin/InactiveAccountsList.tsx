
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserCheck, UserPlus, Copy, ExternalLink } from 'lucide-react';
import { AdminUser, AdminPrestador } from '@/types/admin';
import { adminAccountService } from '@/services/adminAccountService';
import { useToast } from '@/hooks/use-toast';

interface InactiveAccountsListProps {
  inactiveUsers: AdminUser[];
  inactivePrestadores: AdminPrestador[];
  onReactivateUser: (userId: string) => Promise<void>;
  onReactivatePrestador: (prestadorId: string) => Promise<void>;
}

const InactiveAccountsList = ({ 
  inactiveUsers, 
  inactivePrestadores, 
  onReactivateUser, 
  onReactivatePrestador 
}: InactiveAccountsListProps) => {
  const { toast } = useToast();
  const [reactivatingUser, setReactivatingUser] = useState<string | null>(null);
  const [reactivatingPrestador, setReactivatingPrestador] = useState<string | null>(null);

  const handleReactivateUser = async (userId: string) => {
    setReactivatingUser(userId);
    try {
      await onReactivateUser(userId);
      toast({
        title: "Conta reativada!",
        description: "A conta do utilizador foi reativada com sucesso."
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        title: "Erro ao reativar conta",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setReactivatingUser(null);
    }
  };

  const handleReactivatePrestador = async (prestadorId: string) => {
    setReactivatingPrestador(prestadorId);
    try {
      await onReactivatePrestador(prestadorId);
      toast({
        title: "Conta reativada!",
        description: "A conta do prestador foi reativada com sucesso."
      });
    } catch (error) {
      console.error('Error reactivating prestador:', error);
      toast({
        title: "Erro ao reativar conta",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setReactivatingPrestador(null);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência.`
    });
  };

  const openProfileLink = (token: string) => {
    const link = adminAccountService.generateProfileLink(token);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Inactive Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Utilizadores Desativados ({inactiveUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inactiveUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum utilizador desativado</p>
          ) : (
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
                  {inactiveUsers.map((user) => (
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
                        <Badge variant="secondary">Inativo</Badge>
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={reactivatingUser === user.id}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              {reactivatingUser === user.id ? 'A Reativar...' : 'Reativar Conta'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reativar Conta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja reativar a conta de <strong>{user.name}</strong>?
                                <br /><br />
                                A conta será reativada e o utilizador poderá voltar a aceder à plataforma.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleReactivateUser(user.id)}
                              >
                                Reativar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Prestadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Prestadores Desativados ({inactivePrestadores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inactivePrestadores.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum prestador desativado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Link de Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactivePrestadores.map((prestador) => (
                    <TableRow key={prestador.id}>
                      <TableCell className="font-medium">{prestador.name}</TableCell>
                      <TableCell>{prestador.email}</TableCell>
                      <TableCell>{prestador.specialty}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inativo</Badge>
                      </TableCell>
                      <TableCell>{prestador.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {prestador.token.substring(0, 20)}...
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(prestador.token, 'Token')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(adminAccountService.generateProfileLink(prestador.token), 'Link')}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openProfileLink(prestador.token)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Abrir
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reactivatingPrestador === prestador.id}
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                {reactivatingPrestador === prestador.id ? 'A Reativar...' : 'Reativar'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reativar Conta</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja reativar a conta de <strong>{prestador.name}</strong>?
                                  <br /><br />
                                  A conta será reativada e o prestador poderá voltar a aceder à plataforma.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReactivatePrestador(prestador.id)}
                                >
                                  Reativar
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InactiveAccountsList;
