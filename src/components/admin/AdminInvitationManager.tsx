import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, UserPlus, Clock, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminInvitation {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export const AdminInvitationManager = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar convites: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_invitations')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Convite Revogado",
        description: "O convite foi revogado com sucesso.",
      });

      loadInvitations(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao revogar convite: " + error.message,
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    loadInvitations();
  }, []);

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-invite', {
        body: { email: email.trim(), name: name.trim() || undefined }
      });

      if (error) throw error;

      toast({
        title: "Convite Enviado",
        description: `Convite de administrador enviado para ${email}`,
      });

      setEmail('');
      setName('');
      loadInvitations(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar convite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitationStatus = (invitation: AdminInvitation) => {
    if (invitation.used_at) {
      return { status: 'used', label: 'Usado', variant: 'default' as const };
    }
    
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      return { status: 'expired', label: 'Expirado', variant: 'destructive' as const };
    }
    
    return { status: 'pending', label: 'Pendente', variant: 'secondary' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Novo Administrador
          </CardTitle>
          <CardDescription>
            Envie um convite para criar uma nova conta de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do administrador"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando Convite...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </form>

          <Alert className="mt-4">
            <AlertDescription>
              O convite será válido por 7 dias. O utilizador receberá um email com um link para criar a conta de administrador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Enviados
          </CardTitle>
          <CardDescription>
            Histórico de convites de administrador enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando convites...</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum convite enviado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const { status, label, variant } = getInvitationStatus(invitation);
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Enviado: {formatDate(invitation.created_at)}
                          </p>
                          {status === 'pending' && (
                            <p className="text-sm text-muted-foreground">
                              Expira: {formatDate(invitation.expires_at)}
                            </p>
                          )}
                          {invitation.used_at && (
                            <p className="text-sm text-muted-foreground">
                              Usado: {formatDate(invitation.used_at)}
                            </p>
                          )}
                        </div>
                         <div className="flex items-center gap-2">
                           <Badge variant={variant} className="flex items-center gap-1">
                             {status === 'used' && <CheckCircle className="h-3 w-3" />}
                             {status === 'pending' && <Clock className="h-3 w-3" />}
                             {label}
                           </Badge>
                           {status === 'pending' && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleRevokeInvitation(invitation.id)}
                               className="h-7 px-2 text-xs"
                             >
                               <X className="h-3 w-3 mr-1" />
                               Revogar
                             </Button>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};