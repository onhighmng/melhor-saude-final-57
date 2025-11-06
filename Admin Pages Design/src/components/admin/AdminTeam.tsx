import { UserPlus } from 'lucide-react';
import { Button } from '../ui/button';

export function AdminTeam() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Equipa</h1>
        <p className="text-sm text-gray-500">Gerir membros da equipa</p>
      </div>

      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-gray-900 mb-2">Nenhum membro ainda</h3>
        <p className="text-sm text-gray-500 mb-4">Comece a adicionar membros à sua equipa</p>
        <Button className="rounded-xl">Adicionar Membro</Button>
      </div>
    </div>
  );
}
