import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Dumbbell, 
  DollarSign, 
  Scale,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { loadingAnimationConfig, loadingPresets } from '@/components/LoadingAnimationConfig';

interface ReferralBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Company {
  id: string;
  name: string;
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
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  // Step 1: Company & User
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Step 2: Pillar & Prestador
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [selectedPrestador, setSelectedPrestador] = useState<string>('');

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

  // Auto-scroll to time slots when they become available
  useEffect(() => {
    if (selectedDate && availableSlots.length > 0 && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [availableSlots, selectedDate]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      
      // First, try to get companies the specialist has specific access to
      const { data: assignedCompanies, error: assignmentError } = await supabase
        .from('specialist_assignments')
        .select('companies!specialist_assignments_company_id_fkey(id, name)')
        .eq('specialist_id', profile?.id)
        .eq('is_active', true);

      if (assignmentError) {
        console.error('Error loading specialist assignments:', assignmentError);
      }

      // Safely extract companies and filter out null/undefined values
      const specificCompanies = (assignedCompanies || [])
        .map((a: any) => a?.companies)
        .filter((c: any) => c && c.id && c.name) || [];

      // If specialist has no specific assignments (platform-wide access), load all companies
      if (specificCompanies.length === 0) {
        console.log('No specific company assignments found - loading all companies (platform-wide access)');
        const { data: allCompanies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .not('name', 'is', null)
          .order('name');

        if (companiesError) throw companiesError;

        // Filter out any invalid entries
        const validCompanies = (allCompanies || []).filter(c => c && c.id && c.name);
        setCompanies(validCompanies);
        
        if (validCompanies.length === 0) {
          toast({
            title: 'Aviso',
            description: 'Nenhuma empresa encontrada na base de dados',
            variant: 'destructive'
          });
        }
      } else {
        setCompanies(specificCompanies);
      }
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
      
      // Filter out any invalid user entries
      const validUsers = (data || []).filter(u => u && u.id && u.name);
      setUsers(validUsers);
      
      if (validUsers.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum utilizador encontrado nesta empresa',
        });
      }
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
      
      console.log('[ReferralModal] Loading prestadores for pillar:', pillar);
      
      // Query using specialties field (which has UI format: psychological, physical, etc.)
      const { data, error } = await supabase
        .from('prestadores')
        .select('id, name, specialties, pillar_specialties, user_id, blocked_dates')
        .contains('specialties', [pillar])
        .eq('is_active', true);

      if (error) {
        console.error('[ReferralModal] Error loading prestadores:', error);
        throw error;
      }
      
      console.log('[ReferralModal] Found prestadores:', data);
      
      // Filter out any invalid prestador entries
      const validPrestadores = (data || []).filter(p => p && p.id && p.name);
      setPrestadores(validPrestadores);
      
      console.log('[ReferralModal] Valid prestadores:', validPrestadores.length);
      
      if (validPrestadores.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum prestador disponível para este pilar',
        });
      }
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
    if (!selectedDate || !selectedPrestador) {
      console.log('[Slots] Missing date or prestador', { selectedDate, selectedPrestador });
      return;
    }

    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('[Slots] Loading for date:', dateStr, 'prestador:', selectedPrestador);
      
      // Get prestador's blocked dates
      const prestador = prestadores.find(p => p.id === selectedPrestador);
      const blockedDates = prestador?.blocked_dates || [];
      const blockedTimes = blockedDates
        .find((b: any) => b.date === dateStr)
        ?.times || [];
      
      console.log('[Slots] Blocked times:', blockedTimes);

      // Get existing bookings for this prestador on this date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('prestador_id', selectedPrestador)
        .eq('date', dateStr)
        .in('status', ['scheduled', 'confirmed']);

      if (error) {
        console.error('[Slots] Error fetching bookings:', error);
        throw error;
      }

      const booked = bookings?.map(b => b.start_time) || [];
      setBookedSlots(booked);
      console.log('[Slots] Booked times:', booked);

      // Filter available slots
      const available = TIME_SLOTS.filter(
        slot => !blockedTimes.includes(slot) && !booked.includes(slot)
      );
      
      console.log('[Slots] Available slots:', available, 'out of', TIME_SLOTS.length);
      setAvailableSlots(available);
      
      if (available.length === 0) {
        console.warn('[Slots] No available slots for this date!');
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os horários disponíveis',
        variant: 'destructive'
      });
      // Set all slots as available on error as fallback
      setAvailableSlots(TIME_SLOTS);
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

      // Map pillar values to database format
      const pillarMapping: Record<string, string> = {
        'psychological': 'saude_mental',
        'physical': 'bem_estar_fisico',
        'financial': 'assistencia_financeira',
        'legal': 'assistencia_juridica'
      };
      const dbPillar = pillarMapping[selectedPillar] || selectedPillar;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: selectedUser,
          prestador_id: selectedPrestador,
          company_id: selectedCompany,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          pillar: dbPillar,
          session_type: sessionType,
          status: 'scheduled',
          booking_source: 'specialist_referral',
          notes: `Encaminhamento por ${profile?.name || 'Especialista'}\n\n${referralNotes}`
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
              loading ? (
                <LoadingAnimation
                  variant="modal"
                  message="A carregar empresas..."
                  submessage="Aguarde um momento"
                  showProgress={true}
                  mascotSrc={loadingAnimationConfig.mascot}
                  wordmarkSrc={loadingAnimationConfig.wordmark}
                  primaryColor={loadingAnimationConfig.primaryColor}
                  textColor={loadingAnimationConfig.textColor}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Selecionar Empresa e Utilizador</h3>
                    
                    <div className="space-y-4">
                      {/* Company Select */}
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Select value={selectedCompany} onValueChange={(value) => {
                          setSelectedCompany(value);
                          setSelectedUser('');
                        }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecionar empresa..." />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* User Select */}
                      {selectedCompany && (
                        <div className="space-y-2">
                          <Label>Utilizador</Label>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar utilizador..." />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div>
                                    <div>{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
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
                        {loading ? (
                          <LoadingAnimation
                            variant="inline"
                            message="A carregar prestadores..."
                            submessage=""
                            showProgress={false}
                            mascotSrc={loadingAnimationConfig.mascot}
                            primaryColor={loadingAnimationConfig.primaryColor}
                            textColor={loadingAnimationConfig.textColor}
                          />
                        ) : prestadores.length > 0 ? (
                          <Select value={selectedPrestador} onValueChange={setSelectedPrestador}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar prestador..." />
                            </SelectTrigger>
                            <SelectContent>
                              {prestadores.map((prestador) => (
                                <SelectItem key={prestador.id} value={prestador.id}>
                                  <div>
                                    <div>{prestador.name}</div>
                                    {prestador.specialties && prestador.specialties.length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {prestador.specialties.map((spec: string) => 
                                          PILLARS.find(p => p.value === spec)?.label || spec
                                        ).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                            Nenhum prestador disponível para este pilar
                          </div>
                        )}
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
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(''); // Reset time when date changes
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div ref={timeSlotsRef} className="space-y-2">
                        <Label>Horário Disponível</Label>
                        {loading ? (
                          <LoadingAnimation
                            variant="inline"
                            message="A carregar horários..."
                            submessage=""
                            showProgress={false}
                            mascotSrc={loadingAnimationConfig.mascot}
                            primaryColor={loadingAnimationConfig.primaryColor}
                            textColor={loadingAnimationConfig.textColor}
                          />
                        ) : availableSlots.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Sem horários disponíveis nesta data</p>
                            <p className="text-xs mt-2">Tente outra data</p>
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
                            {companies.find(c => c.id === selectedCompany)?.name}
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


