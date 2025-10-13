import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, UserCog } from 'lucide-react';

export const AdminProvidersTab = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserCog className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Gestão de Prestadores</CardTitle>
          <CardDescription className="text-base">
            A gestão completa de prestadores foi movida para uma página dedicada com calendário, métricas e agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => navigate('/admin/providers')}
            size="lg"
            className="gap-2"
          >
            Ir para Gestão de Prestadores
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
