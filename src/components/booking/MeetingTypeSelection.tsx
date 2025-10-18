import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Phone, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MeetingTypeSelectionProps {
  onNext: (meetingType: 'virtual' | 'phone') => void;
  onBack: () => void;
}

export const MeetingTypeSelection = ({ onNext, onBack }: MeetingTypeSelectionProps) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'virtual' | 'phone' | null>(null);

  const handleContinue = () => {
    if (!selectedType) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um tipo de sessão',
        variant: 'destructive',
      });
      return;
    }
    onNext(selectedType);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1"></div>
        <div className="text-center flex-2">
          <h2 className="text-2xl font-bold mb-2">Escolha o Formato da Sessão</h2>
          <p className="text-sm text-muted-foreground">Como prefere ter a sua sessão?</p>
        </div>
        <div className="flex justify-end flex-1">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'virtual' ? 'border-primary border-2 bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('virtual')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Videochamada Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Sessão por videochamada através de plataforma segura
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedType === 'phone' ? 'border-primary border-2 bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('phone')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Chamada Telefónica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Sessão por telefone com privacidade garantida
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedType} className="px-8">
          Selecionar data e hora
        </Button>
      </div>
    </div>
  );
};
