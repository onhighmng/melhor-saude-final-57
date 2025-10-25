import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Star, ArrowLeft } from 'lucide-react';
import { BookingPillar } from './BookingFlow';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
  rating: number;
  experience: string;
}

interface ProviderAssignmentStepProps {
  pillar: BookingPillar;
  assignedProvider: Provider;
  onNext: () => void;
  onBack?: () => void;
}

export const ProviderAssignmentStep = ({ pillar, assignedProvider, onNext, onBack }: ProviderAssignmentStepProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const sessionFormatOptions = [
    { value: 'virtual', label: 'Online (vídeo)' },
    { value: 'phone', label: 'Telefone' }
  ];

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    // Automatically proceed to next step when format is selected
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Especialista Atribuído
          </h2>
          <p className="text-sm text-muted-foreground">
            Encontrámos o especialista ideal para si
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">
                Correspondência encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Conectamos você com nosso especialista
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={assignedProvider.avatar_url} alt={assignedProvider.name} />
                <AvatarFallback className="text-2xl">
                  {assignedProvider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-xl font-semibold">{assignedProvider.name}</h4>
                  <p className="text-primary font-medium">{assignedProvider.specialty}</p>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{assignedProvider.rating.toFixed(1)}</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {assignedProvider.experience}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Format Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">
          Como prefere ter a sua sessão?
        </h3>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {sessionFormatOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleFormatSelect(option.value)}
              className={`px-6 py-4 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedFormat === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50 text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
