import { useState } from 'react';
import { Clock, User, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HistoryItem {
  id: string;
  user_name: string;
  date: string;
  type: 'session' | 'note' | 'assessment';
  pillar: string;
  notes?: string;
}

export function MobileSpecialistHistory() {
  const [searchQuery, setSearchQuery] = useState('');

  const history: HistoryItem[] = [
    {
      id: '1',
      user_name: 'João Silva',
      date: '2025-11-09',
      type: 'session',
      pillar: 'Saúde Mental',
      notes: 'Sessão produtiva sobre gestão de ansiedade'
    },
    {
      id: '2',
      user_name: 'Maria Santos',
      date: '2025-11-08',
      type: 'session',
      pillar: 'Bem-Estar Físico',
      notes: 'Plano de exercícios desenvolvido'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Histórico</h1>
          <p className="text-gray-500 text-sm">Histórico de interações</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        <div className="space-y-3">
          {history.map((item) => (
            <Card 
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{item.user_name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.notes}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs">{item.pillar}</Badge>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(item.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

