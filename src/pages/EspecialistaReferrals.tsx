import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockProviders } from '@/data/mockData';
import { mockAvailableUsers, mockReferrals } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';

const EspecialistaReferrals = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // Filter users by assigned companies
  const filteredUsers = filterByCompanyAccess(mockAvailableUsers);
  const filteredReferrals = filterByCompanyAccess(mockReferrals);

  const pillars = [
    { value: 'psychological', label: 'Saúde Mental' },
    { value: 'physical', label: 'Bem-Estar Físico' },
    { value: 'financial', label: 'Assistência Financeira' },
    { value: 'legal', label: 'Assistência Jurídica' },
  ];

  const filteredProviders = mockProviders.filter(provider => 
    !selectedPillar || provider.pillar === selectedPillar
  );

  const handleCreateReferral = () => {
    if (!selectedUser || !selectedPillar || !selectedProvider) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Encaminhamento criado',
      description: 'O utilizador foi encaminhado para o prestador selecionado.',
    });

    // Reset form
    setSelectedUser('');
    setSelectedPillar('');
    setSelectedProvider('');
    setReferralNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Encaminhamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Encaminhar utilizadores das empresas atribuídas para prestadores externos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Encaminhamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Utilizador *</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um utilizador" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.company}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pillar Selection */}
          <div className="space-y-2">
            <Label htmlFor="pillar">Pilar *</Label>
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pilar" />
              </SelectTrigger>
              <SelectContent>
                {pillars.map((pillar) => (
                  <SelectItem key={pillar.value} value={pillar.value}>
                    {pillar.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Prestador *</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={setSelectedProvider}
              disabled={!selectedPillar}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um prestador" />
              </SelectTrigger>
              <SelectContent>
                {filteredProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.specialty} • {provider.experience}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        ⭐ {provider.rating}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas de Encaminhamento</Label>
            <Input
              id="notes"
              placeholder="Adicione notas sobre o encaminhamento..."
              value={referralNotes}
              onChange={(e) => setReferralNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleCreateReferral} className="w-full">
            <ArrowRight className="h-4 w-4 mr-2" />
            Criar Encaminhamento
          </Button>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Encaminhamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum encaminhamento recente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{referral.user_name}</h4>
                      <Badge variant="outline">{referral.company_name}</Badge>
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status === 'completed' ? 'Concluído' : 'Agendado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Para: {referral.provider_name} • {referral.pillar}
                    </p>
                    {referral.notes && (
                      <p className="text-sm text-muted-foreground">{referral.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Criado em: {new Date(referral.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EspecialistaReferrals;
