import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockReferrals } from '@/data/especialistaGeralMockData';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { isSameDay } from 'date-fns';

const EspecialistaReferrals = () => {
  const { toast } = useToast();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayReferralsModalOpen, setIsDayReferralsModalOpen] = useState(false);
  
  const allReferrals = filterByCompanyAccess(mockReferrals);
  
  // Debug: Show all if filter returns empty (for demo purposes)
  const referralsToShow = allReferrals.length > 0 ? allReferrals : mockReferrals;

  // Filter only pending and scheduled referrals
  const activeReferrals = referralsToShow.filter(r => r.status !== 'completed');

  // Helper functions
  const getPillarLabel = (pillar: string) => {
    const labels = {
      psychological: 'Saúde Mental',
      physical: 'Bem-Estar Físico',
      financial: 'Assistência Financeira',
      legal: 'Assistência Jurídica'
    };
    return labels[pillar as keyof typeof labels] || pillar;
  };

  const getPillarColor = (pillar: string) => {
    const colors = {
      psychological: 'bg-blue-100 text-blue-700',
      physical: 'bg-green-100 text-green-700',
      financial: 'bg-purple-100 text-purple-700',
      legal: 'bg-orange-100 text-orange-700'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Em Espera',
      scheduled: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return {
      variant: variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants = {
      available: 'bg-green-100 text-green-700',
      busy: 'bg-yellow-100 text-yellow-700',
      unavailable: 'bg-red-100 text-red-700'
    };
    const labels = {
      available: 'Disponível',
      busy: 'Ocupado',
      unavailable: 'Indisponível'
    };
    return {
      variant: variants[availability as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[availability as keyof typeof labels] || availability
    };
  };

  // Transform referrals data for calendar
  const calendarData = useMemo(() => {
    const scheduledReferrals = referralsToShow.filter(r => r.scheduled_date && r.status === 'scheduled');
    const groupedByDate = scheduledReferrals.reduce((acc, referral) => {
      const dateKey = referral.scheduled_date.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: referral.id,
        name: `${referral.user_name} - ${referral.provider_name}`,
        time: referral.scheduled_time,
        datetime: `${referral.scheduled_date.split('T')[0]}T${referral.scheduled_time}`,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedByDate).map(([date, events]) => ({
      day: new Date(date),
      events,
    }));
  }, [referralsToShow]);

  // Get referrals for selected date
  const selectedDateReferrals = useMemo(() => {
    if (!selectedDate) return [];
    return referralsToShow.filter(referral => 
      referral.scheduled_date && isSameDay(new Date(referral.scheduled_date), selectedDate)
    ).sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
  }, [referralsToShow, selectedDate]);

  const handleViewCalendar = (referral: any) => {
    setSelectedReferral(referral);
    setIsCalendarModalOpen(true);
  };

  const handleConfirmScheduling = (referral: any) => {
    toast({
      title: 'Agendamento Confirmado',
      description: `Sessão com ${referral.provider_name} confirmada para ${referral.user_name}.`,
    });
  };

  const handleCancelReferral = (referral: any) => {
    toast({
      title: 'Encaminhamento Cancelado',
      description: `Encaminhamento para ${referral.user_name} foi cancelado.`,
      variant: 'destructive',
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayReferralsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const referral = referralsToShow.find(r => r.id === event.id);
    if (referral) {
      setSelectedReferral(referral);
      handleViewCalendar(referral);
    }
  };

  const renderReferralCard = (referral: any) => (
    <Card key={referral.id} className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">{referral.user_name}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{referral.company_name}</p>
          </div>
          <Badge className={`text-xs ${getStatusBadge(referral.status).variant}`}>
            {getStatusBadge(referral.status).label}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pilar:</span>
            <Badge className={`text-xs ${getPillarColor(referral.pillar)}`}>
              {getPillarLabel(referral.pillar)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Prestador:</span>
            <span className="font-medium">{referral.provider_name}</span>
          </div>
          {referral.scheduled_date && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {new Date(referral.scheduled_date).toLocaleDateString('pt-PT')} às {referral.scheduled_time}
              </span>
            </div>
          )}
        </div>

        {referral.notes && (
          <p className="text-xs text-muted-foreground italic border-t pt-2">{referral.notes}</p>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">
          Encaminhamentos Pendentes
        </h1>
        <p className="text-muted-foreground mt-1">
          📩 Casos já avaliados que requerem sessão com prestador externo
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Em Espera</p>
              <p className="text-2xl font-bold">
                {referralsToShow.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agendados</p>
              <p className="text-2xl font-bold">
                {referralsToShow.filter(r => r.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">
                {referralsToShow.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{referralsToShow.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Pilar</TableHead>
              <TableHead>Prestador Sugerido</TableHead>
              <TableHead>Disponibilidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeReferrals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Sem encaminhamentos pendentes
                </TableCell>
              </TableRow>
            ) : (
              activeReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.user_name}</div>
                      <div className="text-xs text-muted-foreground">{referral.company_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getPillarColor(referral.pillar)}`}>
                      {getPillarLabel(referral.pillar)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.provider_name}</div>
                      <div className="text-xs text-muted-foreground">{referral.provider_specialty}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getAvailabilityBadge(referral.availability).variant}`}>
                      {getAvailabilityBadge(referral.availability).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusBadge(referral.status).variant}`}>
                      {getStatusBadge(referral.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCalendar(referral)}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Calendário
                      </Button>
                      {referral.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmScheduling(referral)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelReferral(referral)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Calendar View */}
      <Card className="p-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Calendário de Encaminhamentos</h2>
          <p className="text-sm text-muted-foreground">Visualize todos os encaminhamentos agendados</p>
        </div>
        <FullScreenCalendar 
          data={calendarData}
          onEventClick={handleEventClick}
          onDayClick={handleDateClick}
        />
      </Card>

      {/* Day Referrals Modal */}
      <Dialog open={isDayReferralsModalOpen} onOpenChange={setIsDayReferralsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Encaminhamentos do dia {selectedDate && selectedDate.toLocaleDateString('pt-PT')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {selectedDateReferrals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem encaminhamentos neste dia</p>
                </div>
              ) : (
                selectedDateReferrals.map(renderReferralCard)
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Provider Calendar Modal */}
      {selectedReferral && (
        <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Calendário - {selectedReferral.provider_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <p className="text-muted-foreground">Colaborador</p>
                  <p className="font-medium">{selectedReferral.user_name}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Pilar</p>
                  <Badge className={`text-xs ${getPillarColor(selectedReferral.pillar)}`}>
                    {getPillarLabel(selectedReferral.pillar)}
                  </Badge>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Prestador</p>
                  <p className="font-medium">{selectedReferral.provider_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReferral.provider_specialty}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Estado</p>
                  <Badge className={`text-xs ${getStatusBadge(selectedReferral.status).variant}`}>
                    {getStatusBadge(selectedReferral.status).label}
                  </Badge>
                </div>
              </div>

              {selectedReferral.scheduled_date && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Sessão Agendada</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(selectedReferral.scheduled_date).toLocaleDateString('pt-PT')} às {selectedReferral.scheduled_time}
                    </span>
                  </div>
                </div>
              )}

              {selectedReferral.notes && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Notas do Encaminhamento</p>
                  <p className="text-sm text-muted-foreground">{selectedReferral.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCalendarModalOpen(false)}>
                  Fechar
                </Button>
                {selectedReferral.status === 'scheduled' && (
                  <Button onClick={() => {
                    handleConfirmScheduling(selectedReferral);
                    setIsCalendarModalOpen(false);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Agendamento
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EspecialistaReferrals;
