import { useNavigate } from 'react-router-dom';
import { Calendar, Users, HelpCircle, Video, X, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessionBalance } = useSessionBalance();
  const { upcomingBookings, allBookings, formatPillarName } = useBookings();

  const completedSessions = allBookings?.filter(b => b.status === 'completed') || [];
  const recentCompleted = completedSessions.slice(0, 2);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'confirmed': { label: 'Confirmada', variant: 'secondary' },
      'completed': { label: 'Concluída', variant: 'default' },
      'cancelled': { label: 'Cancelada', variant: 'destructive' },
      'pending': { label: 'Pendente', variant: 'outline' },
    };
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Calculate sessions based on mock data structure
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = 28; // Mock total from design
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Olá, {profile?.name || 'utilizador'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Bem-vinda de volta ao seu espaço de saúde e bem-estar.
          </p>
        </div>

        {/* Session Balance Card - Centered */}
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl border-none shadow-lg">
            <CardContent className="pt-12 pb-8 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <div className="text-7xl font-bold text-primary">{remainingSessions}</div>
                <div className="text-2xl font-semibold">Sessões Restantes</div>
              </div>

              <div className="w-full max-w-2xl space-y-3 px-8">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{usedSessions} usadas</span>
                  <span>{totalSessions} totais</span>
                </div>
                <Progress value={(usedSessions / totalSessions) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {100 - usagePercent}% do plano disponível
                </p>
              </div>

              <Button 
                size="lg" 
                className="px-12 py-6 text-lg rounded-2xl mt-4"
                onClick={() => navigate('/user/book')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Marcar Nova Sessão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Seus Prestadores por Pilar */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Seus Prestadores por Pilar</h2>
              <p className="text-muted-foreground">Profissionais dedicados ao seu bem-estar</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Próximas Sessões */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                Próximas Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.slice(0, 3).map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const isTodaySession = isToday(booking.date);
                  
                  return (
                    <Card 
                      key={booking.id} 
                      className={`border ${booking.status === 'cancelled' ? 'bg-muted/30' : isTodaySession ? 'border-green-200 bg-green-50/50' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-base">
                              {new Date(booking.date).getDate()} de {new Date(booking.date).toLocaleDateString('pt-PT', { month: 'short' })}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {booking.time}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isTodaySession && booking.status === 'confirmed' && (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white">Hoje</Badge>
                            )}
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-4">
                          <div className="font-medium text-primary">{formatPillarName(booking.pillar)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {booking.provider_name}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {isTodaySession && booking.status === 'confirmed' && (
                            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                              <Video className="w-4 h-4 mr-2" />
                              Entrar
                            </Button>
                          )}
                          {booking.status === 'confirmed' && !isTodaySession && (
                            <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive hover:bg-destructive/10">
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground py-4">Nenhuma sessão agendada</p>
              )}
            </CardContent>
          </Card>

          {/* Histórico Rápido */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Histórico Rápido</CardTitle>
              <p className="text-sm text-muted-foreground">{completedSessions.length} sessões concluídas</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCompleted.length > 0 ? (
                <>
                  {recentCompleted.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{formatPillarName(session.pillar)}</div>
                          <div className="text-sm text-muted-foreground">{session.provider_name}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.date).getDate()}/{String(new Date(session.date).getMonth() + 1).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                  {completedSessions.length > 2 && (
                    <Button 
                      variant="link" 
                      className="w-full text-primary p-0 h-auto"
                      onClick={() => navigate('/user/sessions')}
                    >
                      +{completedSessions.length - 2} mais
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Nenhuma sessão concluída ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ajuda & Recursos */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Ajuda & Recursos</h2>
                <p className="text-muted-foreground mb-4">
                  Acesse conteúdos exclusivos para o seu bem-estar
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => navigate('/help-center')}
                >
                  Explorar Recursos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
