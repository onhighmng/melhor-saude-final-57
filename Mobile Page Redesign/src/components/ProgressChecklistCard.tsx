import { TrendingUp } from 'lucide-react';
import { Progress } from './ui/progress';

export function ProgressChecklistCard() {
  const tasks = [
    { id: 1, label: 'Agendar a primeira sessão', progress: 40 },
    { id: 2, label: 'Completar a primeira sessão', progress: 90 },
    { id: 3, label: 'Completar o perfil', progress: 90 },
    { id: 4, label: 'Completar 3 sessões', progress: 40 },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-50 rounded-xl">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-gray-900">Progresso Pessoal</h3>
      </div>

      <p className="text-gray-500 text-sm mb-4 italic">
        "Pequenos passos todos os dias levam a grandes conquistas"
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700">Progresso</span>
          <span className="text-blue-600">20%</span>
        </div>
        <Progress value={20} className="h-2" />

        <div className="space-y-3 mt-5">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                task.progress >= 90 
                  ? 'border-blue-600 bg-blue-600' 
                  : 'border-gray-300'
              }`}>
                {task.progress >= 90 && (
                  <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${task.progress >= 90 ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  {task.label}
                </p>
              </div>
              <span className="text-xs text-gray-400">+{task.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
