import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface OnboardingCompleteProps {
  onContinue: () => void;
}

export const OnboardingComplete = ({ onContinue }: OnboardingCompleteProps) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl text-center">
        <CardHeader>
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl mb-4">Perfeito!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-lg">A sua jornada começa agora.</p>
            <p className="text-muted-foreground">
              Criámos um plano inicial com base nas suas respostas.
            </p>
            <p className="text-sm text-muted-foreground">
              Pode sempre atualizar as suas preferências nas definições.
            </p>
          </div>
          
          <Button onClick={onContinue} size="lg" className="w-full max-w-md">
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
