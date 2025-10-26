import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Video, Link as LinkIcon, Brain, Heart, DollarSign, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  clientName: string;
  pillar: string;
  date: string;
  time: string;
  platform: string;
  meetingLink?: string;
}

interface ProviderSessionManagementModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMeetingLink?: (sessionId: string, link: string) => void;
  onReschedule?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'Saúde Mental':
      return Brain;
    case 'Bem-Estar Físico':
      return Heart;
    case 'Assistência Financeira':
      return DollarSign;
    case 'Assistência Jurídica':
      return Scale;
    default:
      return LinkIcon;
  }
};

const getPillarGradient = (pillar: string) => {
  switch (pillar) {
    case 'Saúde Mental':
      return 'from-blue-400 to-blue-600';
    case 'Bem-Estar Físico':
      return 'from-yellow-400 to-yellow-600';
    case 'Assistência Financeira':
      return 'from-green-400 to-green-600';
    case 'Assistência Jurídica':
      return 'from-purple-400 to-purple-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

const getPillarTextColor = (pillar: string) => {
  switch (pillar) {
    case 'Saúde Mental':
      return 'text-blue-600';
    case 'Bem-Estar Físico':
      return 'text-yellow-600';
    case 'Assistência Financeira':
      return 'text-green-600';
    case 'Assistência Jurídica':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

export function ProviderSessionManagementModal({
  session,
  isOpen,
  onClose,
  onUpdateMeetingLink,
  onReschedule,
  onCancel
}: ProviderSessionManagementModalProps) {
  const { toast } = useToast();
  const [meetingLink, setMeetingLink] = useState(session?.meetingLink || '');

  if (!session) return null;

  const PillarIcon = getPillarIcon(session.pillar);
  const gradientClass = getPillarGradient(session.pillar);
  const textColorClass = getPillarTextColor(session.pillar);

  const handleSaveMeetingLink = () => {
    if (meetingLink.trim()) {
      onUpdateMeetingLink?.(session.id, meetingLink);
      toast({
        title: 'Link guardado',
        description: 'O link da reunião foi atualizado com sucesso.',
      });
    } else {
      toast({
        title: 'Link inválido',
        description: 'Por favor, insira um link válido.',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = () => {
    onReschedule?.(session.id);
    toast({
      title: 'Reagendar sessão',
      description: 'Funcionalidade de reagendamento em desenvolvimento.',
    });
  };

  const handleCancel = () => {
    onCancel?.(session.id);
    toast({
      title: 'Sessão cancelada',
      description: 'A sessão foi cancelada com sucesso.',
      variant: 'destructive',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Icon Circle */}
          <div className={`h-40 w-40 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-2xl`}>
            <PillarIcon className="h-20 w-20 text-white" />
          </div>

          {/* Title */}
          <h2 className={`text-4xl font-bold ${textColorClass}`}>
            {session.pillar}
          </h2>

          {/* Session Details */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-2xl text-muted-foreground">
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7" />
              <span>{session.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-7 w-7" />
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-7 w-7" />
              <span>{session.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-7 w-7" />
              <span>{session.platform}</span>
            </div>
          </div>

          {/* Meeting Link Input Section */}
          <div className="w-full space-y-4 pt-4">
            <Label htmlFor="meeting-link" className="text-xl font-medium">
              Link da Reunião
            </Label>
            <div className="flex gap-4">
              <Input
                id="meeting-link"
                type="url"
                placeholder="Cole o link da reunião aqui..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="flex-1 h-14 text-lg"
              />
              <Button 
                onClick={handleSaveMeetingLink}
                size="lg"
                className="px-8 text-lg"
              >
                Guardar Link
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-6">
            <Button
              onClick={handleReschedule}
              variant="outline"
              size="lg"
              className="h-16 text-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 rounded-full shadow-lg"
            >
              Reagendar
            </Button>
            <Button
              onClick={handleSaveMeetingLink}
              variant="outline"
              size="lg"
              className="h-16 text-xl bg-green-50 hover:bg-green-100 text-green-700 border-green-200 rounded-full shadow-lg"
            >
              Adicionar Link
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="lg"
              className="h-16 text-xl bg-red-50 hover:bg-red-100 text-red-700 border-red-200 rounded-full shadow-lg"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
