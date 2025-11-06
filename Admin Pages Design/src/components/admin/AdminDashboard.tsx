import { Building2, Users, Calendar, BookOpen, Activity } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function AdminDashboard() {
  return (
    <div className="p-4 lg:p-8 pb-20">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Dashboard Geral</h1>
        <p className="text-sm text-gray-500">Visão geral da plataforma Melhor Saúde</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empresas Ativas */}
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 mb-1">Empresas Ativas</h3>
          <p className="text-sm text-gray-600">xx empresas ativas</p>
        </div>

        {/* Atividade da Plataforma */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 md:col-span-2 lg:col-span-1 lg:row-span-2">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 mb-6">Atividade da Plataforma</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Utilização</span>
                <span className="text-purple-600">78%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Prestadores Ativos</span>
                <span className="text-purple-600">24</span>
              </div>
              <p className="text-xs text-gray-500">A fornecer serviços</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Satisfação Média</span>
                <span className="text-purple-600">4.6/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Colaboradores Registados */}
        <div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-100">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-900 mb-1">Colaboradores Registados</h3>
          <p className="text-sm text-gray-600">xxxx utilizadores ativos</p>
        </div>

        {/* Sessões Este Mês */}
        <div className="bg-gradient-to-br from-green-100 to-teal-50 rounded-3xl p-6 border border-green-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" 
               style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop)' }} 
          />
          <div className="relative">
            <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-1">Sessões Este Mês</h3>
            <p className="text-sm text-gray-600">xx40 sessões realizadas</p>
          </div>
        </div>

        {/* Recursos */}
        <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl p-6 border border-orange-200 relative overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-cover bg-center opacity-40" 
               style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop)' }} 
          />
          <div className="relative">
            <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-gray-900 mb-1">Recursos</h3>
            <p className="text-sm text-gray-600">Conteúdos e materiais de apoio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
