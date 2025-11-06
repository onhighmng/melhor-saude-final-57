import { Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  onStartConsultation?: () => void;
  completedSessions?: number;
  totalSessions?: number;
  usagePercent?: number;
}

export function ProgressCard({ 
  onStartConsultation,
  completedSessions = 0,
  totalSessions = 28,
  usagePercent = 0
}: ProgressCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 shadow-lg">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center text-white space-y-4">
        {/* Calendar Icon */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Title and percentage */}
        <div className="text-center w-full">
          <h3 className="text-white/90 mb-1">Progresso Pessoal</h3>
          <div className="text-5xl text-white">{usagePercent}%</div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full">
            <Progress value={usagePercent} className="h-2 bg-white/30" indicatorClassName="bg-white" />
          </div>
        </div>

        {/* Sessions completed */}
        <div className="flex items-center gap-2">
          <div className="text-6xl">{completedSessions}</div>
        </div>
        <div className="text-white/90">Sessões Completas</div>

        {/* CTA Button */}
        <button 
          onClick={onStartConsultation}
          className="w-full mt-2 bg-white text-blue-600 rounded-full py-3 px-6 shadow-md active:scale-95 transition-transform"
        >
          Falar com Especialista
        </button>
      </div>
    </div>
  );
}
