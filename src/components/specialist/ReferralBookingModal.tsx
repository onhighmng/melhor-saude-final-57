import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  ChevronsUpDown, 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Dumbbell, 
  DollarSign, 
  Scale,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Company {
  id: string;
  company_name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Prestador {
  id: string;
  name: string;
  specialties: string[];
  user_id: string;
  blocked_dates?: any[];
}

const PILLARS = [
  { value: 'psychological', label: 'Saúde Mental', icon: Brain, color: 'bg-blue-100 text-blue-700' },
  { value: 'physical', label: 'Bem-Estar Físico', icon: Dumbbell, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'financial', label: 'Assistência Financeira', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  { value: 'legal', label: 'Assistência Jurídica', icon: Scale, color: 'bg-purple-100 text-purple-700' }
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export function ReferralBookingModal({ open, onOpenChange, onSuccess }: ReferralBookingModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Company & User
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [companyOpen, setCompanyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Step 2: Pillar & Prestador
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [selectedPrestador, setSelectedPrestador] = useState<string>('');
  const [prestadorOpen, setPrestadorOpen] = useState(false);

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Step 4: Session Details
  const [sessionType, setSessionType] = useState('individual');
  const [referralNotes, setReferralNotes] = useState('');

  // Load companies when modal opens
  useEffect(() => {
    if (open && profile?.id) {
      loadCompanies();
    }
  }, [open, profile?.id]);

  // Load users when company is selected
  useEffect(() => {
    if (selectedCompany) {
      loadUsers(selectedCompany);
    }
  }, [selectedCompany]);

  // Load prestadores when pillar is selected
  useEffect(() => {
    if (selectedPillar) {
      loadPrestadores(selectedPillar);
    }
  }, [selectedPillar]);

  // Load available slots when date or prestador changes
  useEffect(() => {
    if (selectedDate && selectedPrestador) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedPrestador]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      // Get companies the specialist has access to
      const { data, error } = await supabase
        .from('specialist_assignments')
        .select('companies!specialist_assignments_company_id_fkey(id, company_name)')
        .eq('specialist_id', profile?.id)
        .eq('is_active', true);

      if (error) throw error;

      const uniqueCompanies = data?.map((a: any) => a.companies).filter(Boolean) || [];
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (companyId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('company_id', companyId)
        .eq('role', 'user')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os utilizadores',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrestadores = async (pillar: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prestadores')
        .select('id, name, specialties, user_id, blocked_dates')
        .contains('specialties', [pillar])
        .eq('is_active', true);

      if (error) throw error;
      setPrestadores(data || []);
    } catch (error) {
      console.error('Error loading prestadores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os prestadores',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedPrestador) return;

    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Get prestador's blocked dates
      const prestador = prestadores.find(p => p.id === selectedPrestador);
      const blockedDates = prestador?.blocked_dates || [];
      const blockedTimes = blockedDates
        .find((b: any) => b.date === dateStr)
        ?.times || [];

      // Get existing bookings for this prestador on this date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('prestador_id', selectedPrestador)
        .eq('booking_date', dateStr)
        .in('status', ['scheduled', 'confirmed']);

      if (error) throw error;

      const booked = bookings?.map(b => b.start_time) || [];
      setBookedSlots(booked);

      // Filter available slots
      const available = TIME_SLOTS.filter(
        slot => !blockedTimes.includes(slot) && !booked.includes(slot)
      );
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários disponíveis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedPrestador || !selectedDate || !selectedTime || !referralNotes) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    if (referralNotes.length < 10) {
      toast({
        title: 'Notas insuficientes',
        description: 'Por favor, adicione mais detalhes nas notas de encaminhamento (mínimo 10 caracteres)',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const user = users.find(u => u.id === selectedUser);
      const prestador = prestadores.find(p => p.id === selectedPrestador);
      const pillarLabel = PILLARS.find(p => p.value === selectedPillar)?.label || selectedPillar;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: selectedUser,
          prestador_id: selectedPrestador,
          company_id: selectedCompany,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          pillar: selectedPillar,
          session_type: sessionType,
          status: 'scheduled',
          referred_by: profile?.id,
          referral_notes: referralNotes
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: selectedUser,
        type: 'session_booked',
        title: 'Sessão Agendada',
        message: `Foi agendada uma sessão de ${pillarLabel} com ${prestador?.name} para ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}`,
        related_booking_id: booking.id,
        priority: 'high'
      });

      // Create notification for prestador
      await supabase.from('notifications').insert({
        user_id: prestador?.user_id,
        type: 'session_booked',
        title: 'Nova Sessão Agendada',
        message: `Sessão agendada com ${user?.name} para ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime} - Encaminhamento de ${profile?.full_name}`,
        related_booking_id: booking.id,
        priority: 'high'
      });

      toast({
        title: 'Sessão Encaminhada',
        description: `Sessão agendada com sucesso para ${user?.name}`
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a sessão',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedCompany('');
    setSelectedUser('');
    setSelectedPillar('');
    setSelectedPrestador('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setSessionType('individual');
    setReferralNotes('');
    onOpenChange(false);
  };

  const canProceedStep1 = selectedCompany && selectedUser;
  const canProceedStep2 = selectedPillar && selectedPrestador;
  const canProceedStep3 = selectedDate && selectedTime;
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3 && referralNotes.length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Encaminhar Sessão</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2",
                      currentStep > step ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Step 1: Company & User */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecionar Empresa e Utilizador</h3>
                  
                  <div className="space-y-4">
                    {/* Company Select */}
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={companyOpen}
                            className="w-full justify-between"
                          >
                            {selectedCompany
                              ? companies.find((c) => c.id === selectedCompany)?.company_name
                              : "Selecionar empresa..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Procurar empresa..." />
                            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-[200px]">
                                {companies.map((company) => (
                                  <CommandItem
                                    key={company.id}
                                    value={company.company_name}
                                    onSelect={() => {
                                      setSelectedCompany(company.id);
                                      setSelectedUser('');
                                      setCompanyOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCompany === company.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <Building2 className="mr-2 h-4 w-4" />
                                    {company.company_name}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* User Select */}
                    {selectedCompany && (
                      <div className="space-y-2">
                        <Label>Utilizador</Label>
                        <Popover open={userOpen} onOpenChange={setUserOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={userOpen}
                              className="w-full justify-between"
                            >
                              {selectedUser
                                ? users.find((u) => u.id === selectedUser)?.name
                                : "Selecionar utilizador..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Procurar utilizador..." />
                              <CommandEmpty>Nenhum utilizador encontrado.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-[200px]">
                                  {users.map((user) => (
                                    <CommandItem
                                      key={user.id}
                                      value={user.name}
                                      onSelect={() => {
                                        setSelectedUser(user.id);
                                        setUserOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedUser === user.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <UserIcon className="mr-2 h-4 w-4" />
                                      <div>
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pillar & Prestador */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecionar Pilar e Prestador</h3>
                  
                  <div className="space-y-4">
                    {/* Pillar Selection */}
                    <div className="space-y-2">
                      <Label>Pilar</Label>
                      <RadioGroup value={selectedPillar} onValueChange={setSelectedPillar}>
                        <div className="grid grid-cols-2 gap-3">
                          {PILLARS.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                              <Card
                                key={pillar.value}
                                className={cn(
                                  "cursor-pointer transition-all p-4",
                                  selectedPillar === pillar.value
                                    ? "ring-2 ring-primary"
                                    : "hover:bg-muted"
                                )}
                                onClick={() => {
                                  setSelectedPillar(pillar.value);
                                  setSelectedPrestador('');
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value={pillar.value} id={pillar.value} />
                                  <Icon className="h-5 w-5" />
                                  <Label htmlFor={pillar.value} className="cursor-pointer flex-1">
                                    {pillar.label}
                                  </Label>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Prestador Select */}
                    {selectedPillar && (
                      <div className="space-y-2">
                        <Label>Prestador</Label>
                        <Popover open={prestadorOpen} onOpenChange={setPrestadorOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={prestadorOpen}
                              className="w-full justify-between"
                            >
                              {selectedPrestador
                                ? prestadores.find((p) => p.id === selectedPrestador)?.name
                                : "Selecionar prestador..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Procurar prestador..." />
                              <CommandEmpty>Nenhum prestador encontrado.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-[200px]">
                                  {prestadores.map((prestador) => (
                                    <CommandItem
                                      key={prestador.id}
                                      value={prestador.name}
                                      onSelect={() => {
                                        setSelectedPrestador(prestador.id);
                                        setPrestadorOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedPrestador === prestador.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div>
                                        <div>{prestador.name}</div>
                                        <div className="flex gap-1 mt-1">
                                          {prestador.specialties?.map((spec: string) => (
                                            <Badge key={spec} variant="secondary" className="text-xs">
                                              {PILLARS.find(p => p.value === spec)?.label || spec}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecionar Data e Hora</h3>
                  
                  <div className="space-y-4">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div className="space-y-2">
                        <Label>Horário Disponível</Label>
                        {availableSlots.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Sem horários disponíveis nesta data</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-5 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                variant={selectedTime === slot ? "default" : "outline"}
                                className="w-full"
                                onClick={() => setSelectedTime(slot)}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Session Details & Summary */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detalhes da Sessão</h3>
                  
                  <div className="space-y-4">
                    {/* Session Type */}
                    <div className="space-y-2">
                      <Label>Tipo de Sessão</Label>
                      <Select value={sessionType} onValueChange={setSessionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="couple">Casal</SelectItem>
                          <SelectItem value="group">Grupo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Referral Notes */}
                    <div className="space-y-2">
                      <Label>Notas de Encaminhamento *</Label>
                      <Textarea
                        placeholder="Descreva o motivo do encaminhamento, contexto, necessidades especiais..."
                        value={referralNotes}
                        onChange={(e) => setReferralNotes(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        {referralNotes.length} caracteres (mínimo 10)
                      </p>
                    </div>

                    {/* Summary */}
                    <Card className="bg-muted p-4">
                      <h4 className="font-semibold mb-3">Resumo da Sessão</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Empresa:</span>
                          <span className="font-medium">
                            {companies.find(c => c.id === selectedCompany)?.company_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Utilizador:</span>
                          <span className="font-medium">
                            {users.find(u => u.id === selectedUser)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pilar:</span>
                          <span className="font-medium">
                            {PILLARS.find(p => p.value === selectedPillar)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prestador:</span>
                          <span className="font-medium">
                            {prestadores.find(p => p.id === selectedPrestador)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium">
                            {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hora:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium capitalize">{sessionType}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
              >
                {submitting ? 'A agendar...' : 'Confirmar Encaminhamento'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

