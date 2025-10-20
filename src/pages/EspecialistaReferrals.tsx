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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Plus } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
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
  
  // Modal states
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);

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
    setIsNewReferralModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Encaminhamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Encaminhar utilizadores das empresas atribuídas para prestadores externos
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="w-full flex-1">
        <BentoGrid className="h-full" style={{ gridAutoRows: '1fr' }}>
          <BentoCard
            name="Novo Encaminhamento"
            description={`${filteredUsers.length} utilizadores disponíveis`}
            Icon={Plus}
            href="#"
            cta="Criar"
            className="col-span-full"
            background={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />}
            onClick={() => setIsNewReferralModalOpen(true)}
            iconColor="text-blue-600"
            textColor="text-gray-900"
            descriptionColor="text-gray-600"
          />
        </BentoGrid>

        {/* Modals */}
        <Dialog open={isNewReferralModalOpen} onOpenChange={setIsNewReferralModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Encaminhamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewReferralModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReferral}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Criar Encaminhamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EspecialistaReferrals;
