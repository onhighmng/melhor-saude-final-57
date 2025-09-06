
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, UserCheck, UserMinus } from 'lucide-react';
import { AdminPrestador } from '@/types/admin';
import { adminAccountService } from '@/services/adminAccountService';
import { useToast } from '@/hooks/use-toast';

interface PrestadoresListProps {
  prestadores: AdminPrestador[];
  onDeactivatePrestador: (prestadorId: string) => Promise<void>;
}

const PrestadoresList = ({ prestadores, onDeactivatePrestador }: PrestadoresListProps) => {
  const { toast } = useToast();
  const [deactivatingPrestador, setDeactivatingPrestador] = useState<string | null>(null);

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

  const handleDeactivatePrestador = async (prestadorId: string) => {
    setDeactivatingPrestador(prestadorId);
    try {
      await onDeactivatePrestador(prestadorId);
    } catch (error) {
      console.error('Error deactivating prestador:', error);
    } finally {
      setDeactivatingPrestador(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Prestadores Ativos ({prestadores.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              {prestadores.map((prestador) => (
                <TableRow key={prestador.id}>
                  <TableCell className="font-medium">{prestador.name}</TableCell>
                  <TableCell>{prestador.email}</TableCell>
                  <TableCell>{prestador.specialty}</TableCell>
                  <TableCell>
                    <Badge variant={prestador.isActive ? "default" : "secondary"}>
                      {prestador.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
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
                            variant="destructive"
                            disabled={deactivatingPrestador === prestador.id}
                          >
                            <UserMinus className="w-3 h-3 mr-1" />
                            {deactivatingPrestador === prestador.id ? 'A Desativar...' : 'Desativar'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desativar Conta</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja desativar a conta de <strong>{prestador.name}</strong>?
                              <br /><br />
                              A conta será desativada mas não eliminada. Pode ser reativada a qualquer momento na secção "Contas Desativadas".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeactivatePrestador(prestador.id)}
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

export default PrestadoresList;
