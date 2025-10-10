import { Target, CheckCircle2, XCircle, Edit2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface UserGoals {
  mainGoal: string;
  wantToAchieve: string[];
  wantToAvoid: string[];
}

interface GoalsDisplayProps {
  goals: UserGoals | null;
  onEdit: () => void;
}

export const GoalsDisplay = ({ goals, onEdit }: GoalsDisplayProps) => {
  if (!goals) {
    return (
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              Defina os Seus Objetivos
            </h3>
            <p className="text-muted-foreground max-w-md">
              Conte-nos o que quer alcançar para podermos ajudá-lo melhor na sua jornada de bem-estar
            </p>
          </div>

          <Button onClick={onEdit} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Definir Objetivos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Os Meus Objetivos
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit} className="gap-2">
          <Edit2 className="w-4 h-4" />
          Editar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Goal */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Objetivo Principal
            </h4>
          </div>
          <p className="text-lg font-medium leading-relaxed pl-4 border-l-2 border-primary">
            {goals.mainGoal}
          </p>
        </div>

        {/* Want to Achieve */}
        {goals.wantToAchieve.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Quero Alcançar
              </h4>
            </div>
            <div className="grid gap-2 pl-1">
              {goals.wantToAchieve.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Want to Avoid */}
        {goals.wantToAvoid.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Quero Evitar
              </h4>
            </div>
            <div className="grid gap-2 pl-1">
              {goals.wantToAvoid.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50"
                >
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {goals.wantToAchieve.length} objetivo{goals.wantToAchieve.length !== 1 ? 's' : ''} definido{goals.wantToAchieve.length !== 1 ? 's' : ''}
            </span>
            <Badge variant="secondary" className="gap-1">
              <Target className="w-3 h-3" />
              Ativo
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};