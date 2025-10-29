import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMilestones } from '@/hooks/useUserMilestones';
import { MilestoneBadge } from './MilestoneBadge';

export const SessionMilestones = () => {
  const { user } = useAuth();
  const { milestones, isLoading } = useUserMilestones(user?.id);

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Marcos de Sessão
          </h3>
          <span className="text-sm text-muted-foreground">
            {milestones.sessionCount} sessões
          </span>
        </div>

        <Progress value={milestones.sessionProgress} className="h-3" />

        <div className="space-y-2">
          <MilestoneBadge
            label="Primeira Sessão"
            completed={milestones.firstSessionComplete}
          />
          <MilestoneBadge
            label="Três Sessões"
            completed={milestones.threeSessionsComplete}
          />
        </div>
      </div>
    </Card>
  );
};
