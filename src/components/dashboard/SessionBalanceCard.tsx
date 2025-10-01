import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertTriangle } from 'lucide-react';
import { SessionBalance } from '@/types/session';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionBalanceCardProps {
  sessionBalance: SessionBalance | null;
  loading: boolean;
}

export const SessionBalanceCard: React.FC<SessionBalanceCardProps> = ({ 
  sessionBalance, 
  loading 
}) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data for demonstration - in real app this would come from sessionBalance
  const totalSessions = 28;
  const usedSessions = 20;
  const remainingSessions = sessionBalance?.totalRemaining || (totalSessions - usedSessions);
  const hasZeroBalance = remainingSessions === 0;
  const progressValue = (usedSessions / totalSessions) * 100;

  return (
    <div className="space-y-6">
      {hasZeroBalance && (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="font-medium">
            O seu saldo terminou. Contacte o administrador para mais sessões.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="relative overflow-hidden border-0 shadow-custom-xl bg-gradient-to-br from-white via-white to-vibrant-blue/5">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-bright-royal/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-green/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
        
        <CardHeader className="relative pb-8 pt-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-bright-royal to-vibrant-blue rounded-2xl shadow-custom-lg mb-4">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-transparent bg-gradient-to-r from-bright-royal to-vibrant-blue bg-clip-text">
              {remainingSessions}
            </CardTitle>
            <p className="text-xl font-semibold text-foreground">Sessões Restantes</p>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-8 pb-8">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">{usedSessions} usadas</span>
              <span className="text-muted-foreground">{totalSessions} totais</span>
            </div>
            <div className="relative">
              <Progress value={progressValue} className="h-3 bg-slate-grey/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-bright-royal/20 to-vibrant-blue/20 rounded-full"></div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(100 - progressValue)}% do plano disponível
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              className="w-full max-w-sm h-14 text-lg font-semibold bg-gradient-to-r from-bright-royal to-vibrant-blue hover:from-bright-royal/90 hover:to-vibrant-blue/90 shadow-custom-lg hover:shadow-custom-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={hasZeroBalance}
              onClick={() => navigate('/user/book')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Marcar Nova Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};