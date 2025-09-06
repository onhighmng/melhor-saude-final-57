import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Calendar, User, FileText } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  duration: number;
  session_type: string;
  status: string;
  notes?: string;
  prestador_notes?: string;
  session_usage_id?: string;
  user_name?: string;
  user_email?: string;
}

interface SessionManagementProps {
  booking: Booking;
  onStatusUpdate: () => void;
}

const SessionManagement = ({ booking, onStatusUpdate }: SessionManagementProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [prestadorNotes, setPrestadorNotes] = useState(booking.prestador_notes || '');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não Compareceu';
      default: return status;
    }
  };

  const handleCompleteSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-management', {
        body: {
          bookingId: booking.id,
          action: 'complete_session'
        }
      });

      if (error) {
        throw error;
      }

      // Update prestador notes if provided
      if (prestadorNotes.trim() && prestadorNotes !== booking.prestador_notes) {
        await supabase
          .from('bookings')
          .update({ prestador_notes: prestadorNotes })
          .eq('id', booking.id);
      }

      toast({
        title: "Sessão Concluída!",
        description: "A sessão foi marcada como concluída e a sessão do utilizador foi deduzida.",
        variant: "default"
      });

      setShowCompleteDialog(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error completing session:', error);
      toast({
        title: "Erro ao concluir sessão",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelWithRefund = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-management', {
        body: {
          bookingId: booking.id,
          action: 'cancel_with_refund',
          reason: 'Cancelled by prestador with session refund'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sessão Cancelada",
        description: "A sessão foi cancelada e a sessão do utilizador foi reembolsada.",
        variant: "default"
      });

      onStatusUpdate();
    } catch (error: any) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Erro ao cancelar sessão",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canCompleteSession = ['confirmed', 'scheduled'].includes(booking.status);
  const canCancelSession = ['confirmed', 'scheduled'].includes(booking.status);
  const isSessionDeducted = booking.session_usage_id !== null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {formatDate(booking.booking_date)}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {booking.user_name || booking.user_email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {booking.duration} minutos
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
            {isSessionDeducted && (
              <Badge variant="outline" className="text-xs">
                Sessão Deduzida ✓
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {booking.notes && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Notas do Utilizador:</Label>
            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{booking.notes}</p>
          </div>
        )}

        <div>
          <Label htmlFor="prestador-notes">Notas do Prestador:</Label>
          <Textarea
            id="prestador-notes"
            value={prestadorNotes}
            onChange={(e) => setPrestadorNotes(e.target.value)}
            placeholder="Adicione notas sobre a sessão..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-2">
          {canCompleteSession && (
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" disabled={isLoading}>
                  <CheckCircle className="w-4 h-4" />
                  Concluir Sessão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Conclusão da Sessão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    Tem certeza que deseja marcar esta sessão como concluída? 
                    Isto irá automaticamente deduzir uma sessão da conta do utilizador.
                  </p>
                  {!isSessionDeducted && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Atenção:</strong> Uma sessão será deduzida automaticamente da conta do utilizador.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCompleteDialog(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCompleteSession}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isLoading ? 'A processar...' : 'Confirmar Conclusão'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {canCancelSession && (
            <Button 
              variant="outline" 
              onClick={handleCancelWithRefund}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancelar com Reembolso
            </Button>
          )}

          {booking.status === 'completed' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Sessão Concluída
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManagement;