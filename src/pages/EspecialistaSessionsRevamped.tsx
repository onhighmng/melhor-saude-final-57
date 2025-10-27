import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Phone, Clock, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SessionNoteModal } from '@/components/specialist/SessionNoteModal';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { AvailabilitySettings } from '@/components/specialist/AvailabilitySettings';
import { isSameDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, User } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';

const EspecialistaSessionsRevamped = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { filterByCompanyAccess } = useCompanyFilter();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDaySessionsModalOpen, setIsDaySessionsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSelfBookingModalOpen, setIsSelfBookingModalOpen] = useState(false);
  const [isExternalBookingModalOpen, setIsExternalBookingModalOpen] = useState(false);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking flow state
  const [bookingStep, setBookingStep] = useState<'company' | 'pillar' | 'especialista' | 'colaborador' | 'datetime' | 'notes' | 'confirm'>('company');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const { data: sessions } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles(name, email),
            companies(company_name),
            prestadores(name, specialties)
          `)
          .eq('status', 'scheduled')
          .order('booking_date', { ascending: true });

        setAllSessions(sessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [profile?.id]);
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | null>(null);
  const [selectedBookingTime, setSelectedBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [externalProviderName, setExternalProviderName] = useState('');
  const [currentBookingType, setCurrentBookingType] = useState<'self' | 'external' | null>(null);
  const [colaboradorOpen, setColaboradorOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  
  // Filter sessions by company access
  const sessionsToShow = filterByCompanyAccess(allSessions);

  // Mock external specialists list
  const externalSpecialists = [
    { value: 'provider-1', label: 'Dr. Ana Mendes' },
    { value: 'provider-2', label: 'Dr. Carlos Ferreira' },
    { value: 'provider-3', label: 'Dra. Sofia Rodrigues' },
    { value: 'provider-4', label: 'Dr. Pedro Sousa' },
    { value: 'provider-5', label: 'Dra. Inês Martins' },
    { value: 'provider-6', label: 'Dr. Ricardo Alves' },
    { value: 'provider-7', label: 'Dra. Carolina Santos' },
    { value: 'provider-8', label: 'Dr. Hugo Costa' },
    { value: 'provider-9', label: 'Dra. Beatriz Gomes' },
    { value: 'provider-10', label: 'Dr. Miguel Oliveira' },
    { value: 'provider-11', label: 'Dra. Patrícia Fernandes' },
    { value: 'provider-12', label: 'Dr. Jorge Silva' },
    { value: 'provider-13', label: 'Dra. Catarina Dias' },
    { value: 'provider-14', label: 'Dr. Nuno Lourenço' },
    { value: 'provider-15', label: 'Dra. Isabel Pereira' },
  ];

  // Mock colaboradores list
  const colaboradores = [
    { value: 'colab-1', label: 'João Silva' },
    { value: 'colab-2', label: 'Maria Santos' },
    { value: 'colab-3', label: 'Pedro Oliveira' },
    { value: 'colab-4', label: 'Ana Costa' },
    { value: 'colab-5', label: 'Carlos Mendes' },
    { value: 'colab-6', label: 'Sofia Alves' },
    { value: 'colab-7', label: 'Rafael Martins' },
    { value: 'colab-8', label: 'Inês Ferreira' },
    { value: 'colab-9', label: 'Ricardo Sousa' },
    { value: 'colab-10', label: 'Luísa Ribeiro' },
    { value: 'colab-11', label: 'Fernando Lopes' },
    { value: 'colab-12', label: 'Beatriz Gomes' },
    { value: 'colab-13', label: 'Miguel Rocha' },
    { value: 'colab-14', label: 'Carolina Dias' },
    { value: 'colab-15', label: 'Gonçalo Marques' },
    { value: 'colab-16', label: 'Catarina Monteiro' },
    { value: 'colab-17', label: 'Afonso Azevedo' },
    { value: 'colab-18', label: 'Margarida Freitas' },
    { value: 'colab-19', label: 'Diogo Correia' },
    { value: 'colab-20', label: 'Teresa Carvalho' },
    { value: 'colab-21', label: 'Nuno Coelho' },
    { value: 'colab-22', label: 'Patrícia Ramos' },
    { value: 'colab-23', label: 'Bruno Teixeira' },
    { value: 'colab-24', label: 'Sandra Batista' },
    { value: 'colab-25', label: 'João Paulo' },
    { value: 'colab-26', label: 'Rita Barbosa' },
    { value: 'colab-27', label: 'Hugo Tavares' },
    { value: 'colab-28', label: 'Isabel Lourenço' },
    { value: 'colab-29', label: 'Paulo Nunes' },
    { value: 'colab-30', label: 'Adriana Henriques' },
    { value: 'colab-31', label: 'Manuel Antunes' },
    { value: 'colab-32', label: 'Helena Machado' },
    { value: 'colab-33', label: 'Jorge Cardoso' },
    { value: 'colab-34', label: 'Cristina Pinto' },
    { value: 'colab-35', label: 'Luís Barros' },
    { value: 'colab-36', label: 'Fátima Mendes' },
    { value: 'colab-37', label: 'António Leite' },
    { value: 'colab-38', label: 'Marisa Fernandes' },
    { value: 'colab-39', label: 'Vítor Pires' },
    { value: 'colab-40', label: 'Susana Cordeiro' },
  ];

  // Helper functions (moved before useMemo to avoid hoisting issues)
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
      psychological: 'bg-blue-100 text-blue-700 border-blue-300',
      physical: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      financial: 'bg-green-100 text-green-700 border-green-300',
      legal: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[pillar as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return {
      variant: variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const getSessionTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />;
  };

  const getSessionTypeLabel = (type: string) => {
    return type === 'video' ? 'Vídeo' : 'Chamada';
  };

  // Transform sessions data for calendar
  const calendarData = useMemo(() => {
    const groupedByDate = sessionsToShow.reduce((acc, session) => {
      const dateKey = session.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: session.id,
        name: `${session.profiles?.name || 'Unknown'} - ${getPillarLabel(session.pillar)}`,
        time: session.start_time || '00:00',
        datetime: `${session.date}T${session.start_time || '00:00'}`,
        userName: session.profiles?.name || 'Unknown',
        pillar: session.pillar,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groupedByDate).map(([date, events]) => ({
      day: new Date(date),
      events: events as Array<{
        id: string;
        name: string;
        time: string;
        datetime: string;
        userName: string;
        pillar: string;
      }>,
    }));
  }, [sessionsToShow]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsToShow.filter(session => 
      isSameDay(new Date(session.date), selectedDate)
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [sessionsToShow, selectedDate]);

  const handleSaveNote = (notes: string, outcome: string) => {
    toast({
      title: 'Nota Guardada',
      description: `Nota interna guardada. Resultado: ${outcome}`,
    });
    setIsNoteModalOpen(false);
  };

  const handleAddNote = (session: any) => {
    setSelectedSession(session);
    setIsNoteModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDaySessionsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    const session = sessionsToShow.find(s => s.id === event.id);
    if (session) {
      setSelectedSession(session);
      setIsNoteModalOpen(true);
    }
  };

  const handleAddEvent = () => {
    setIsBookingModalOpen(true);
  };

  const handleSelfBooking = () => {
    setIsBookingModalOpen(false);
    setCurrentBookingType('self');
    setBookingStep('company');
    setIsSelfBookingModalOpen(true);
  };

  const handleExternalBooking = () => {
    setIsBookingModalOpen(false);
    setCurrentBookingType('external');
    setBookingStep('company');
    setIsExternalBookingModalOpen(true);
  };

  const handleBookingStepNext = () => {
    if (bookingStep === 'company') setBookingStep('pillar');
    else if (bookingStep === 'pillar') setBookingStep('especialista');
    else if (bookingStep === 'especialista') setBookingStep('colaborador');
    else if (bookingStep === 'colaborador') setBookingStep('datetime');
    else if (bookingStep === 'datetime') setBookingStep('notes');
    else if (bookingStep === 'notes') setBookingStep('confirm');
  };

  const handleBookingStepBack = () => {
    if (bookingStep === 'pillar') setBookingStep('company');
    else if (bookingStep === 'especialista') setBookingStep('pillar');
    else if (bookingStep === 'colaborador') setBookingStep('especialista');
    else if (bookingStep === 'datetime') setBookingStep('colaborador');
    else if (bookingStep === 'notes') setBookingStep('datetime');
    else if (bookingStep === 'confirm') setBookingStep('notes');
  };

  const handleFinalConfirm = () => {
    toast({
      title: 'Sessão Agendada',
      description: `Sessão agendada com sucesso para ${selectedBookingDate?.toLocaleDateString('pt-PT')} às ${selectedBookingTime}. O admin será notificado.`,
    });

    // Reset all state
    setIsSelfBookingModalOpen(false);
    setIsExternalBookingModalOpen(false);
    setBookingStep('company');
    setSelectedCompany('');
    setSelectedPillar('');
    setSelectedPatient('');
    setExternalProviderName('');
    setSelectedBookingDate(null);
    setSelectedBookingTime('');
    setBookingNotes('');
    setCurrentBookingType(null);
  };

  const handleConfirmSelfBooking = () => {
    handleFinalConfirm();
  };

  const handleConfirmExternalBooking = () => {
    handleFinalConfirm();
  };

  const resetBookingFlow = () => {
    setBookingStep('company');
    setSelectedCompany('');
    setSelectedPillar('');
    setSelectedPatient('');
    setExternalProviderName('');
    setSelectedBookingDate(null);
    setSelectedBookingTime('');
    setBookingNotes('');
    setCurrentBookingType(null);
  };

  const renderSessionCard = (session: any) => (
    <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-2">{session.user_name}</h4>
            <p className="text-sm text-foreground">{session.company_name}</p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getPillarColor(session.pillar)}`}>
            {getPillarLabel(session.pillar)}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-2">
              {getSessionTypeIcon(session.session_type || 'video')}
              <span>{getSessionTypeLabel(session.session_type || 'video')}</span>
            </div>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getStatusBadge(session.status).variant}`}>
            {getStatusBadge(session.status).label}
          </Badge>
        </div>

        {session.notes && (
          <p className="text-sm text-foreground italic">{session.notes}</p>
        )}

        <Button
          size="default"
          variant="outline"
          onClick={() => handleAddNote(session)}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver/Adicionar Notas
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-heading font-bold">
          Calendário Pessoal
        </h1>
        <p className="text-muted-foreground mt-1 text-base font-semibold">
          Sessões futuras e passadas com tipo e estado
        </p>
      </div>

      <Card className="p-0">
        <FullScreenCalendar 
          data={calendarData}
          onEventClick={handleEventClick}
          onDayClick={handleDateClick}
          onSetAvailability={() => setIsAvailabilityModalOpen(true)}
          onAddEvent={handleAddEvent}
        />
      </Card>

      {/* Day Sessions Modal */}
      <Dialog open={isDaySessionsModalOpen} onOpenChange={setIsDaySessionsModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Sessões do dia {selectedDate && selectedDate.toLocaleDateString('pt-PT')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-4 pr-4">
              {selectedDateSessions.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sem sessões neste dia</p>
                </div>
              ) : (
                selectedDateSessions.map(renderSessionCard)
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Session Note Modal */}
      {selectedSession && (
        <SessionNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          session={selectedSession}
          onSave={handleSaveNote}
        />
      )}

      {/* Availability Settings Modal */}
      <AvailabilitySettings 
        open={isAvailabilityModalOpen}
        onOpenChange={setIsAvailabilityModalOpen}
      />

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agendar Nova Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Agendamento</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={handleSelfBooking}
                >
                  <Video className="h-6 w-6 mb-2" />
                  Para Si Mesmo
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={handleExternalBooking}
                >
                  <Phone className="h-6 w-6 mb-2" />
                  Especialista Externo
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             {/* External Booking Multi-Step Modal */}
       <Dialog open={isExternalBookingModalOpen} onOpenChange={(open) => {
         setIsExternalBookingModalOpen(open);
         if (!open) resetBookingFlow();
       }}>
         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Agendar Sessão com Especialista Externo</DialogTitle>
           </DialogHeader>

           <div className="space-y-6 py-4">
                           {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-6">
                {[
                  { step: 'company', label: 'Empresa' },
                  { step: 'pillar', label: 'Pilar' },
                  { step: 'especialista', label: 'Especialista' },
                  { step: 'colaborador', label: 'Colaborador' },
                  { step: 'datetime', label: 'Data/Hora' },
                  { step: 'notes', label: 'Notas' },
                  { step: 'confirm', label: 'Confirmar' }
                ].map(({ step, label }, index) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      bookingStep === step || ['company', 'pillar', 'especialista', 'colaborador', 'datetime', 'notes', 'confirm'].indexOf(bookingStep) > index
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-muted'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 6 && <div className={`h-1 flex-1 mx-1 ${['company', 'pillar', 'especialista', 'colaborador', 'datetime', 'notes'].indexOf(bookingStep) >= index ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                ))}
              </div>

             {/* Step 1: Company Selection */}
             {bookingStep === 'company' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Empresa</Label>
                   <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione a empresa" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="comp-1">Empresa Exemplo Lda</SelectItem>
                       <SelectItem value="comp-2">Tech Solutions MZ</SelectItem>
                       <SelectItem value="comp-3">Consultoria Financeira Ltda</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={() => setIsExternalBookingModalOpen(false)}>
                     Cancelar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!selectedCompany}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

             {/* Step 2: Pilar Selection */}
             {bookingStep === 'pillar' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Pilar de Bem-Estar</Label>
                   <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione o pilar" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="psychological">Saúde Mental</SelectItem>
                       <SelectItem value="physical">Bem-Estar Físico</SelectItem>
                       <SelectItem value="financial">Assistência Financeira</SelectItem>
                       <SelectItem value="legal">Assistência Jurídica</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!selectedPillar}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

                           {/* Step 3: External Specialist Selection */}
              {bookingStep === 'especialista' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Selecione o Especialista Externo</Label>
                   <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={providerOpen}
                         className="w-full justify-between"
                       >
                         {externalProviderName
                           ? externalSpecialists.find((provider) => provider.value === externalProviderName)?.label
                           : "Selecione o especialista externo..."}
                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                       <Command>
                         <CommandInput placeholder="Pesquisar especialista..." />
                         <CommandList>
                           <CommandEmpty>Nenhum especialista encontrado.</CommandEmpty>
                           <CommandGroup>
                             {externalSpecialists.map((provider) => (
                               <CommandItem
                                 key={provider.value}
                                 value={provider.label}
                                 onSelect={() => {
                                   setExternalProviderName(provider.value === externalProviderName ? "" : provider.value);
                                   setProviderOpen(false);
                                 }}
                               >
                                 <Check
                                   className={`mr-2 h-4 w-4 ${
                                     externalProviderName === provider.value ? "opacity-100" : "opacity-0"
                                   }`}
                                 />
                                 {provider.label}
                               </CommandItem>
                             ))}
                           </CommandGroup>
                         </CommandList>
                       </Command>
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!externalProviderName}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

             {/* Step 4: Colaborador Selection */}
             {bookingStep === 'colaborador' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Selecione o Colaborador</Label>
                   <Popover open={colaboradorOpen} onOpenChange={setColaboradorOpen}>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={colaboradorOpen}
                         className="w-full justify-between"
                       >
                         {selectedPatient
                           ? colaboradores.find((colab) => colab.value === selectedPatient)?.label
                           : "Selecione o colaborador..."}
                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                       <Command>
                         <CommandInput placeholder="Pesquisar colaborador..." />
                         <CommandList>
                           <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                           <CommandGroup>
                             {colaboradores.map((colab) => (
                               <CommandItem
                                 key={colab.value}
                                 value={colab.label}
                                 onSelect={() => {
                                   setSelectedPatient(colab.value === selectedPatient ? "" : colab.value);
                                   setColaboradorOpen(false);
                                 }}
                               >
                                 <Check
                                   className={`mr-2 h-4 w-4 ${
                                     selectedPatient === colab.value ? "opacity-100" : "opacity-0"
                                   }`}
                                 />
                                 {colab.label}
                               </CommandItem>
                             ))}
                           </CommandGroup>
                         </CommandList>
                       </Command>
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!selectedPatient}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

             {/* Step 5: Date & Time Selection */}
             {bookingStep === 'datetime' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Data da Sessão</Label>
                   <Input
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     value={selectedBookingDate ? selectedBookingDate.toISOString().split('T')[0] : ''}
                     onChange={(e) => setSelectedBookingDate(e.target.value ? new Date(e.target.value) : null)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Hora da Sessão</Label>
                   <Select value={selectedBookingTime} onValueChange={setSelectedBookingTime}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione a hora" />
                     </SelectTrigger>
                     <SelectContent>
                       {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                         <SelectItem key={time} value={time}>{time}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!selectedBookingDate || !selectedBookingTime}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

             {/* Step 6: Notes */}
             {bookingStep === 'notes' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Notas Adicionais (Opcional)</Label>
                   <Textarea
                     placeholder="Adicione quaisquer notas ou informações relevantes..."
                     value={bookingNotes}
                     onChange={(e) => setBookingNotes(e.target.value)}
                     rows={4}
                   />
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

             {/* Step 7: Confirmation */}
             {bookingStep === 'confirm' && (
               <div className="space-y-4">
                 <div className="bg-muted p-4 rounded-lg space-y-2">
                   <h4 className="font-semibold">Resumo da Sessão</h4>
                   <div className="space-y-1 text-sm">
                     <p><span className="font-medium">Tipo:</span> Especialista Externo</p>
                     <p><span className="font-medium">Empresa:</span> {selectedCompany}</p>
                     <p><span className="font-medium">Pilar:</span> {getPillarLabel(selectedPillar)}</p>
                     <p><span className="font-medium">Especialista:</span> {externalSpecialists.find((p) => p.value === externalProviderName)?.label}</p>
                     <p><span className="font-medium">Colaborador:</span> {colaboradores.find((c) => c.value === selectedPatient)?.label}</p>
                     <p><span className="font-medium">Data:</span> {selectedBookingDate?.toLocaleDateString('pt-PT')}</p>
                     <p><span className="font-medium">Hora:</span> {selectedBookingTime}</p>
                     {bookingNotes && <p><span className="font-medium">Notas:</span> {bookingNotes}</p>}
                   </div>
                 </div>
                 <div className="bg-blue-50 p-4 rounded-lg">
                   <p className="text-sm text-blue-900">
                     O admin será notificado sobre este agendamento e poderá acompanhar o caso.
                   </p>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleConfirmExternalBooking} className="bg-green-600 hover:bg-green-700">
                     <CheckCircle className="h-4 w-4 mr-2" />
                     Confirmar Agendamento
                   </Button>
                 </div>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Self Booking Multi-Step Modal */}
       <Dialog open={isSelfBookingModalOpen} onOpenChange={(open) => {
         setIsSelfBookingModalOpen(open);
         if (!open) resetBookingFlow();
       }}>
         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Agendar Sessão para Si Mesmo</DialogTitle>
           </DialogHeader>

           <div className="space-y-6 py-4">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[
                { step: 'company', label: 'Empresa' },
                { step: 'pillar', label: 'Pilar' },
                { step: 'colaborador', label: 'Colaborador' },
                { step: 'datetime', label: 'Data/Hora' },
                { step: 'notes', label: 'Notas' },
                { step: 'confirm', label: 'Confirmar' }
              ].map(({ step, label }, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    bookingStep === step || ['company', 'pillar', 'colaborador', 'datetime', 'notes', 'confirm'].indexOf(bookingStep) > index
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-muted'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 5 && <div className={`h-1 flex-1 mx-1 ${['company', 'pillar', 'colaborador', 'datetime', 'notes'].indexOf(bookingStep) >= index ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Company Selection */}
            {bookingStep === 'company' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comp-1">Empresa Exemplo Lda</SelectItem>
                      <SelectItem value="comp-2">Tech Solutions MZ</SelectItem>
                      <SelectItem value="comp-3">Consultoria Financeira Ltda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsSelfBookingModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleBookingStepNext} disabled={!selectedCompany}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Pilar Selection */}
            {bookingStep === 'pillar' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pilar de Bem-Estar</Label>
                  <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pilar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psychological">Saúde Mental</SelectItem>
                      <SelectItem value="physical">Bem-Estar Físico</SelectItem>
                      <SelectItem value="financial">Assistência Financeira</SelectItem>
                      <SelectItem value="legal">Assistência Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleBookingStepBack}>
                    Voltar
                  </Button>
                  <Button onClick={handleBookingStepNext} disabled={!selectedPillar}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

                         {/* Step 3: Colaborador Selection */}
             {bookingStep === 'colaborador' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Selecione o Colaborador</Label>
                   <Popover open={colaboradorOpen} onOpenChange={setColaboradorOpen}>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={colaboradorOpen}
                         className="w-full justify-between"
                       >
                         {selectedPatient
                           ? colaboradores.find((colab) => colab.value === selectedPatient)?.label
                           : "Selecione o colaborador..."}
                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                       <Command>
                         <CommandInput placeholder="Pesquisar colaborador..." />
                         <CommandList>
                           <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                           <CommandGroup>
                             {colaboradores.map((colab) => (
                               <CommandItem
                                 key={colab.value}
                                 value={colab.label}
                                 onSelect={() => {
                                   setSelectedPatient(colab.value === selectedPatient ? "" : colab.value);
                                   setColaboradorOpen(false);
                                 }}
                               >
                                 <Check
                                   className={`mr-2 h-4 w-4 ${
                                     selectedPatient === colab.value ? "opacity-100" : "opacity-0"
                                   }`}
                                 />
                                 {colab.label}
                               </CommandItem>
                             ))}
                           </CommandGroup>
                         </CommandList>
                       </Command>
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div className="flex justify-between gap-2 pt-4 border-t">
                   <Button variant="outline" onClick={handleBookingStepBack}>
                     Voltar
                   </Button>
                   <Button onClick={handleBookingStepNext} disabled={!selectedPatient}>
                     Próximo
                   </Button>
                 </div>
               </div>
             )}

            {/* Step 4: Date & Time Selection */}
            {bookingStep === 'datetime' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data da Sessão</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedBookingDate ? selectedBookingDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setSelectedBookingDate(e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora da Sessão</Label>
                  <Select value={selectedBookingTime} onValueChange={setSelectedBookingTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleBookingStepBack}>
                    Voltar
                  </Button>
                  <Button onClick={handleBookingStepNext} disabled={!selectedBookingDate || !selectedBookingTime}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Notes */}
            {bookingStep === 'notes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notas Adicionais (Opcional)</Label>
                  <Textarea
                    placeholder="Adicione quaisquer notas ou informações relevantes..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleBookingStepBack}>
                    Voltar
                  </Button>
                  <Button onClick={handleBookingStepNext}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {bookingStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Resumo da Sessão</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Tipo:</span> Para Si Mesmo</p>
                    <p><span className="font-medium">Empresa:</span> {selectedCompany}</p>
                    <p><span className="font-medium">Pilar:</span> {getPillarLabel(selectedPillar)}</p>
                    <p><span className="font-medium">Colaborador:</span> {selectedPatient}</p>
                    <p><span className="font-medium">Data:</span> {selectedBookingDate?.toLocaleDateString('pt-PT')}</p>
                    <p><span className="font-medium">Hora:</span> {selectedBookingTime}</p>
                    {bookingNotes && <p><span className="font-medium">Notas:</span> {bookingNotes}</p>}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    O admin será notificado sobre este agendamento e poderá acompanhar o caso.
                  </p>
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleBookingStepBack}>
                    Voltar
                  </Button>
                  <Button onClick={handleConfirmSelfBooking} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Agendamento
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialistaSessionsRevamped;
