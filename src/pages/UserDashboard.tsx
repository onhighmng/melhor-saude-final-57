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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-normal tracking-tight">
            Olá, {profile?.name || 'ana.silva'}! 👋
          </h1>
          <p className="text-muted-foreground text-base">
            Bem-vinda de volta ao seu espaço de saúde e bem-estar.
          </p>
        </div>

        {/* Session Balance Card - Centered */}
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl border shadow-sm bg-card">
            <CardContent className="pt-16 pb-12 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-[#4A90E2] flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-1">
                <div className="text-8xl font-bold text-[#4A90E2]">{remainingSessions}</div>
                <div className="text-2xl font-serif">Sessões Restantes</div>
              </div>

              <div className="w-full max-w-3xl space-y-2 px-8">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{usedSessions} usadas</span>
                  <span>{totalSessions} totais</span>
                </div>
                <Progress value={(usedSessions / totalSessions) * 100} className="h-2.5 bg-gray-200" />
                <p className="text-sm text-muted-foreground pt-1">
                  {usagePercent}% do plano disponível
                </p>
              </div>

              <Button 
                size="lg" 
                className="px-10 py-6 text-base rounded-xl bg-[#4A90E2] hover:bg-[#3A7BC8] text-white mt-2"
                onClick={() => navigate('/user/book')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Marcar Nova Sessão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Seus Prestadores por Pilar */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4A90E2] flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-normal">Seus Prestadores por Pilar</h2>
              <p className="text-muted-foreground text-base">Profissionais dedicados ao seu bem-estar</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Próximas Sessões */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-normal">
                <div className="w-12 h-12 rounded-2xl bg-[#4A90E2] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Próximas Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.slice(0, 3).map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const isTodaySession = isToday(booking.date);
                  
                  return (
                    <Card 
                      key={booking.id} 
                      className={`${booking.status === 'cancelled' ? 'bg-muted/30 border-muted' : isTodaySession ? 'border-[#22C55E] border-2 bg-[#F0FDF4]' : 'border bg-background'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-base">
                              {new Date(booking.date).getDate()} de {new Date(booking.date).toLocaleDateString('pt-PT', { month: 'short' })}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {booking.time}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isTodaySession && booking.status === 'confirmed' && (
                              <Badge className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-3">Hoje</Badge>
                            )}
                            <Badge 
                              variant={statusBadge.variant}
                              className={statusBadge.variant === 'secondary' ? 'bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD] rounded-full' : statusBadge.variant === 'destructive' ? 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] rounded-full' : ''}
                            >
                              {statusBadge.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-0.5 mb-4">
                          <div className="font-medium text-[#4A90E2]">{formatPillarName(booking.pillar)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {booking.provider_name}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {isTodaySession && booking.status === 'confirmed' && (
                            <Button size="sm" className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg">
                              <Video className="w-4 h-4 mr-2" />
                              Entrar
                            </Button>
                          )}
                          {booking.status === 'confirmed' && !isTodaySession && (
                            <Button size="sm" variant="outline" className="flex-1 text-[#DC2626] border-[#DC2626] hover:bg-[#FEE2E2] rounded-lg">
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
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-normal">Histórico Rápido</CardTitle>
              <p className="text-sm text-muted-foreground">{completedSessions.length} sessões concluídas</p>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
              {recentCompleted.length > 0 ? (
                <>
                  {recentCompleted.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#4A90E2]" />
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
                      className="w-full text-[#4A90E2] p-0 h-auto mt-2 hover:no-underline"
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
        <Card className="border shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-normal mb-2">Ajuda & Recursos</h2>
                <p className="text-muted-foreground mb-4 text-base">
                  Acesse conteúdos exclusivos para o seu bem-estar
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-white/90 border-gray-200"
                  onClick={() => navigate('/user/help')}
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
