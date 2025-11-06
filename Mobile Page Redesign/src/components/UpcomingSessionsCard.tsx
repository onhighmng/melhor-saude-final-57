import { CalendarClock } from 'lucide-react';

export function UpcomingSessionsCard() {
  return (
    <div className="bg-yellow-50 rounded-3xl p-5 shadow-sm border border-yellow-100">
      <h3 className="text-gray-900 mb-4">Próximas Sessões</h3>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-4 bg-yellow-100 rounded-full mb-3">
          <CalendarClock className="w-8 h-8 text-yellow-600" />
        </div>
        <p className="text-gray-600">Nenhuma sessão agendada</p>
      </div>
    </div>
  );
}
