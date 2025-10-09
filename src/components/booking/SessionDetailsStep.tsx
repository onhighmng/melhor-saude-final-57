import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, Video, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionDetailsStepProps {
  selectedDate: Date;
  selectedTime: string;
  selectedDuration: number;
  objective: string;
  onTimeSelect: (time: string) => void;
  onDurationSelect: (duration: number) => void;
  onObjectiveChange: (objective: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isBooking: boolean;
  pillarName: string;
}

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  notes: z.string().trim().max(1000).optional(),
});

export default function SessionDetailsStep({
  selectedDate,
  selectedTime,
  selectedDuration,
  objective,
  onObjectiveChange,
  onConfirm,
  onBack,
  isBooking,
  pillarName
}: SessionDetailsStepProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: objective,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateTime = () => {
    const dayName = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][selectedDate.getDay()];
    const monthName = format(selectedDate, "MMMM", { locale: pt });
    const day = selectedDate.getDate();
    const year = selectedDate.getFullYear();
    
    return `${dayName}, ${monthName} ${day}, ${year}`;
  };

  const calculateEndTime = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const endHours = Math.floor((hours * 60 + minutes + selectedDuration) / 60);
    const endMinutes = (hours * 60 + minutes + selectedDuration) % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    const result = bookingSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0].toString()] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onObjectiveChange(formData.notes || '');
    onConfirm();
  };

  return (
    <div className="flex gap-8 max-w-6xl mx-auto">
      {/* Left Sidebar - Booking Summary */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-4">
          {/* Logo/Brand */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary-foreground">MS</span>
            </div>
            <h2 className="text-xl font-comfortaa font-semibold text-foreground mb-1">
              {pillarName}
            </h2>
            <p className="text-small text-muted-foreground">
              Sessão de apoio personalizado
            </p>
          </div>

          {/* Session Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTime} – {calculateEndTime()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-foreground">{selectedDuration}m</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-foreground">{t('user:booking.sessionDetails.videoCall')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-foreground">Europa/Lisboa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1">
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
              Seu nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('user:booking.sessionDetails.namePlaceholder')}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
              Endereço de email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('user:booking.sessionDetails.emailPlaceholder')}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-foreground mb-2 block">
              Notas adicionais
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('user:booking.sessionDetails.detailsPlaceholder')}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Ao continuar, concorda com os nossos{' '}
              <a href="/terms" className="text-primary hover:underline">
                Termos
              </a>{' '}
              e{' '}
              <a href="/terms" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isBooking}
              className="px-8"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isBooking}
              className="flex-1"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}