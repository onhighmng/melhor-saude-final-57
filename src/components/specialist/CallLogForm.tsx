import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpecialistCallLog } from '@/types/specialist';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CallLogFormProps {
  sessionId: string;
  userId: string;
  onSubmit: (data: Partial<SpecialistCallLog>) => Promise<void>;
  onCancel: () => void;
}

export const CallLogForm: React.FC<CallLogFormProps> = ({ sessionId, userId, onSubmit, onCancel }) => {
  const { t } = useTranslation('specialist');
  const [formData, setFormData] = useState({
    call_duration: '',
    outcome: '',
    call_notes: '',
    call_status: 'completed' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        chat_session_id: sessionId,
        user_id: userId,
        call_duration: formData.call_duration ? parseInt(formData.call_duration) : null,
        outcome: formData.outcome as any,
        call_notes: formData.call_notes,
        call_status: formData.call_status,
        completed_at: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Registar Chamada Telefónica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="call_duration">Duração da Chamada (minutos)</Label>
            <Input
              id="call_duration"
              type="number"
              min="1"
              value={formData.call_duration}
              onChange={(e) => setFormData({ ...formData, call_duration: e.target.value })}
              placeholder="Ex: 15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Resultado da Chamada</Label>
            <Select
              value={formData.outcome}
              onValueChange={(value) => setFormData({ ...formData, outcome: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved_by_phone">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Resolvido por Telefone
                  </div>
                </SelectItem>
                <SelectItem value="session_booked">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sessão Agendada
                  </div>
                </SelectItem>
                <SelectItem value="escalated">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Escalado para Acompanhamento
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="call_notes">Notas da Chamada</Label>
            <Textarea
              id="call_notes"
              value={formData.call_notes}
              onChange={(e) => setFormData({ ...formData, call_notes: e.target.value })}
              placeholder="Descreva o que foi discutido e as ações tomadas..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('callLog.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.outcome}>
              {isSubmitting ? t('callLog.saving') : t('callLog.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
