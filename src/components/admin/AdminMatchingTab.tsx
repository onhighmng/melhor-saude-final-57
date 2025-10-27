import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch, Bot, UserCog, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const priorityColors = {
  high: 'bg-red-500/10 text-red-700 dark:text-red-400',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

export default function AdminMatchingTab() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCases();
  }, []);

  useEffect(() => {
    if (selectedCase && selectedCase !== '') {
      const caseData = pendingCases.find(c => c.id === selectedCase);
      if (caseData?.pillar) {
        loadSpecialists(caseData.pillar);
      }
    }
  }, [selectedCase]);

  const loadPendingCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          user:profiles!user_id(name, email)
        `)
        .eq('phone_contact_made', true)
        .is('session_booked_by_specialist', null)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingCases(data || []);
    } catch (error: any) {
      console.error('Error loading pending cases:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar casos pendentes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialists = async (pillar: string) => {
    try {
      const { data, error } = await supabase
        .from('prestadores')
        .select(`
          *,
          profiles:user_id(name, email)
        `)
        .eq('is_active', true)
        .eq('is_approved', true)
        .contains('pillar_specialties', [pillar]);

      if (error) throw error;
      setSpecialists(data || []);
    } catch (error) {
      console.error('Error loading specialists:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedSpecialist || !selectedDate || !selectedCase) return;
    
    try {
      // Get case details
      const { data: chatSession } = await supabase
        .from('chat_sessions')
        .select('user_id, pillar')
        .eq('id', selectedCase)
        .single();

      if (!chatSession) throw new Error('Chat session not found');

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: chatSession.user_id,
          prestador_id: selectedSpecialist,
          date: selectedDate,
          start_time: '10:00',
          end_time: '11:00',
          pillar: chatSession.pillar,
          meeting_type: 'phone',
          status: 'scheduled',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update chat session
      await supabase
        .from('chat_sessions')
        .update({
          session_booked_by_specialist: selectedSpecialist,
          status: 'resolved'
        })
        .eq('id', selectedCase);

      // Log specialist action
      await supabase.from('specialist_call_logs').insert({
        chat_session_id: selectedCase,
        user_id: chatSession.user_id,
        specialist_id: profile?.id,
        booking_id: booking.id,
        call_status: 'completed',
        session_booked: true
      });

      // Admin log
      await supabase.from('admin_logs').insert({
        admin_id: profile?.id,
        action: 'specialist_assigned',
        entity_type: 'chat_session',
        entity_id: selectedCase,
        details: { specialist_id: selectedSpecialist, booking_id: booking.id }
      });

      toast({
        title: 'Sucesso',
        description: 'Especialista atribuído com sucesso'
      });

      loadPendingCases();
      setIsDialogOpen(false);
      setSelectedCase(null);
      setSelectedSpecialist('');
    } catch (error: any) {
      console.error('Error assigning specialist:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atribuir especialista',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Casos Pendentes de Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Pilar</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Data Pedido</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell className="font-medium">{case_.user?.name || 'N/A'}</TableCell>
                  <TableCell>{case_.pillar || 'N/A'}</TableCell>
                  <TableCell>{case_.pillar || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Bot className="h-3 w-3" />
                      Bot
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors['high']}>
                      Alta
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(case_.created_at).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCase(case_.id);
                        setIsDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Atribuir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Especialista</DialogTitle>
              <DialogDescription>
                Selecione o especialista mais adequado para este caso.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedCase && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Colaborador:</span>
                    <span className="font-medium">
                      {pendingCases.find(c => c.id === selectedCase)?.user?.name || 'N/A'}
                    </span>
                    <span className="text-muted-foreground">Pilar:</span>
                    <span className="font-medium">
                      {pendingCases.find(c => c.id === selectedCase)?.pillar || 'N/A'}
                    </span>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {pendingCases.find(c => c.id === selectedCase)?.user?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Data da Sessão</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Especialista</Label>
                <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialists.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        {specialist.profiles?.name || 'N/A'} - {specialist.specialty || 'Especialista'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAssign} disabled={!selectedSpecialist || !selectedDate}>
                Confirmar Atribuição
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
