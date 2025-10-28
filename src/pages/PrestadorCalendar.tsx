import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pillar, PILLAR_DISPLAY_NAMES } from '@/integrations/supabase/types-unified';

interface AvailabilitySlot {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

interface SpecificAvailability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  reason?: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  pillar: Pillar;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  session_type: 'virtual' | 'presential';
  notes?: string;
}

interface CalendarStats {
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  utilization_rate: number;
  upcoming_sessions: number;
}

export const PrestadorCalendar: React.FC = () => {
  const { t } = useTranslation('prestador');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [specificAvailability, setSpecificAvailability] = useState<SpecificAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    total_slots: 0,
    available_slots: 0,
    booked_slots: 0,
    utilization_rate: 0,
    upcoming_sessions: 0
  });
  
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isAddingSpecific, setIsAddingSpecific] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');

  const daysOfWeek = [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ];

  useEffect(() => {
    if (profile?.id) {
      loadCalendarData();
    }
  }, [profile?.id]);

  const loadCalendarData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      await Promise.all([
        loadAvailabilitySlots(),
        loadSpecificAvailability(),
        loadBookings(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do calendário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailabilitySlots = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('prestador_id', profile.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error loading availability slots:', error);
    }
  };

  const loadSpecificAvailability = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('prestador_schedule')
        .select('*')
        .eq('prestador_id', profile.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      
      const specificSlots: SpecificAvailability[] = (data || []).map(slot => ({
        id: slot.id,
        date: slot.date,
        start_time: slot.start_time || '09:00',
        end_time: slot.end_time || '17:00',
        is_available: slot.is_available,
        reason: slot.reason,
        created_at: slot.created_at
      }));

      setSpecificAvailability(specificSlots);
    } catch (error) {
      console.error('Error loading specific availability:', error);
    }
  };

  const loadBookings = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          pillar,
          date,
          start_time,
          end_time,
          status,
          session_type,
          notes,
          profiles!bookings_user_id_fkey(name)
        `)
        .eq('prestador_id', profile.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const bookingData: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        user_name: booking.profiles?.name || 'Utilizador',
        pillar: booking.pillar as Pillar,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status as any,
        session_type: booking.session_type as any,
        notes: booking.notes
      }));

      setBookings(bookingData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadStats = async () => {
    if (!profile?.id) return;

    try {
      const upcomingSessions = bookings.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      ).length;

      const totalSlots = availabilitySlots.length;
      const availableSlots = availabilitySlots.filter(s => s.is_available).length;
      const bookedSlots = bookings.filter(b => b.status === 'confirmed').length;
      const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      setStats({
        total_slots: totalSlots,
        available_slots: availableSlots,
        booked_slots: bookedSlots,
        utilization_rate: utilizationRate,
        upcoming_sessions: upcomingSessions
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addAvailabilitySlot = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('provider_availability')
        .insert({
          prestador_id: profile.id,
          day_of_week: selectedDay,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Disponibilidade adicionada",
        description: `${daysOfWeek[selectedDay]} das ${startTime} às ${endTime}`
      });

      setIsAddingSlot(false);
      loadAvailabilitySlots();
    } catch (error) {
      console.error('Error adding availability slot:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar disponibilidade",
        variant: "destructive"
      });
    }
  };

  const addSpecificAvailability = async () => {
    if (!profile?.id || !selectedDate) return;

    try {
      const { error } = await supabase
        .from('prestador_schedule')
        .insert({
          prestador_id: profile.id,
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          reason: reason || null
        });

      if (error) throw error;

      toast({
        title: "Disponibilidade específica adicionada",
        description: `${selectedDate} das ${startTime} às ${endTime}`
      });

      setIsAddingSpecific(false);
      setSelectedDate('');
      setReason('');
      loadSpecificAvailability();
    } catch (error) {
      console.error('Error adding specific availability:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar disponibilidade específica",
        variant: "destructive"
      });
    }
  };

  const removeAvailabilitySlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Disponibilidade removida",
        description: "Slot de disponibilidade removido"
      });

      loadAvailabilitySlots();
    } catch (error) {
      console.error('Error removing availability slot:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover disponibilidade",
        variant: "destructive"
      });
    }
  };

  const toggleAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .update({ is_available: isAvailable })
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Disponibilidade atualizada",
        description: isAvailable ? "Slot ativado" : "Slot desativado"
      });

      loadAvailabilitySlots();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar disponibilidade",
        variant: "destructive"
      });
    }
  };

  const exportCalendar = () => {
    const icalData = generateICalData();
    const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendario-${profile?.name || 'prestador'}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Calendário exportado",
      description: "Ficheiro iCal descarregado"
    });
  };

  const generateICalData = (): string => {
    const now = new Date();
    const icalHeader = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Melhor Saude//Prestador Calendar//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    const icalEvents = bookings.map(booking => [
      'BEGIN:VEVENT',
      `UID:${booking.id}@melhorsaude.com`,
      `DTSTART:${booking.date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00`,
      `DTEND:${booking.date.replace(/-/g, '')}T${booking.end_time.replace(/:/g, '')}00`,
      `SUMMARY:Sessão com ${booking.user_name}`,
      `DESCRIPTION:Sessão de ${PILLAR_DISPLAY_NAMES[booking.pillar]} - ${booking.session_type}`,
      `STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      `CREATED:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'END:VEVENT'
    ]);

    const icalFooter = ['END:VCALENDAR'];

    return [...icalHeader, ...icalEvents.flat(), ...icalFooter].join('\r\n');
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmada</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calendário</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendário</h2>
          <p className="text-muted-foreground">
            Gerir sua disponibilidade e sessões
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCalendar} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Disponibilidade</DialogTitle>
                <DialogDescription>
                  Adicionar um slot de disponibilidade semanal
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Dia da Semana</Label>
                  <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Hora de Início</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Hora de Fim</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingSlot(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addAvailabilitySlot}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total_slots}</p>
              <p className="text-sm text-muted-foreground">Total Slots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.available_slots}</p>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.booked_slots}</p>
              <p className="text-sm text-muted-foreground">Reservados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.utilization_rate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Utilização</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.upcoming_sessions}</p>
              <p className="text-sm text-muted-foreground">Próximas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList>
          <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
          <TabsTrigger value="bookings">Sessões</TabsTrigger>
          <TabsTrigger value="specific">Específica</TabsTrigger>
        </TabsList>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade Semanal</CardTitle>
              <CardDescription>
                Configure sua disponibilidade por dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day, index) => {
                  const daySlots = availabilitySlots.filter(slot => slot.day_of_week === index);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <p className="font-medium">{day}</p>
                        </div>
                        
                        <div className="flex-1">
                          {daySlots.length > 0 ? (
                            <div className="space-y-2">
                              {daySlots.map((slot) => (
                                <div key={slot.id} className="flex items-center gap-2">
                                  <Badge variant={slot.is_available ? "default" : "secondary"}>
                                    {slot.start_time} - {slot.end_time}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAvailability(slot.id, !slot.is_available)}
                                  >
                                    {slot.is_available ? 'Desativar' : 'Ativar'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeAvailabilitySlot(slot.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Nenhum slot configurado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessões Agendadas</CardTitle>
              <CardDescription>
                Suas próximas sessões com utilizadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{booking.user_name}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {PILLAR_DISPLAY_NAMES[booking.pillar]} • {booking.session_type}
                          </p>
                          
                          <p className="text-sm">
                            {new Date(booking.date).toLocaleDateString('pt-PT')} às {booking.start_time}
                          </p>
                          
                          {booking.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Notas: {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma sessão agendada</p>
                    <p className="text-sm">Suas sessões aparecerão aqui quando forem agendadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specific Availability Tab */}
        <TabsContent value="specific" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Disponibilidade Específica
                <Dialog open={isAddingSpecific} onOpenChange={setIsAddingSpecific}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Disponibilidade Específica</DialogTitle>
                      <DialogDescription>
                        Adicionar disponibilidade para uma data específica
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="specific-date">Data</Label>
                        <Input
                          id="specific-date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="specific-start-time">Hora de Início</Label>
                          <Input
                            id="specific-start-time"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specific-end-time">Hora de Fim</Label>
                          <Input
                            id="specific-end-time"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo (opcional)</Label>
                        <Input
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Ex: Reunião, férias, etc."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingSpecific(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addSpecificAvailability}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Configure disponibilidade para datas específicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specificAvailability.length > 0 ? (
                  specificAvailability.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {new Date(slot.date).toLocaleDateString('pt-PT', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </h3>
                            <Badge variant={slot.is_available ? "default" : "secondary"}>
                              {slot.is_available ? 'Disponível' : 'Indisponível'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {slot.start_time} - {slot.end_time}
                          </p>
                          
                          {slot.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Motivo: {slot.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma disponibilidade específica</p>
                    <p className="text-sm">Adicione disponibilidade para datas específicas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrestadorCalendar;