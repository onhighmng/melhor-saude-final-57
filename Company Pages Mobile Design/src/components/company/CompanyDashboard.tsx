import { Star, Users, Calendar, Activity, TrendingUp, Minus } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function CompanyDashboard() {
  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-1">Dashboard da Empresa</h1>
          <p className="text-slate-500 text-sm">
            Visão geral do programa de bem-estar e utilização dos serviços
          </p>
        </div>

        {/* Satisfaction Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Star className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Satisfação Média</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-900">8.7</span>
                <span className="text-slate-600 text-sm">/10</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                Avaliação dos colaboradores
              </p>
            </div>
          </div>
        </div>

        {/* Usage Overview Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 mb-4">Visão Geral de Utilização</h2>
          <p className="text-slate-600 text-sm mb-4">
            Principais métricas de envolvimento dos colaboradores
          </p>

          <div className="space-y-4">
            {/* Active Collaborators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 text-sm">Atividade dos Colaboradores</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-emerald-600 min-w-[3rem] text-right">78%</span>
              </div>
            </div>

            {/* Active */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 text-sm">Ativos</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-blue-600 min-w-[3rem] text-right">78%</span>
              </div>
            </div>

            {/* Inactive */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-rose-600" />
                  <span className="text-slate-700 text-sm">Inativos</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
                <span className="text-rose-600 min-w-[3rem] text-right">22%</span>
              </div>
            </div>
          </div>

          {/* Most Used Pillar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-violet-50 rounded-xl p-2">
                <div className="w-5 h-5 rounded-full bg-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-700 text-sm mb-1">Pilar Mais Utilizado</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-slate-900">Saúde Mental</span>
                  <span className="text-violet-600">42%</span>
                </div>
                <p className="text-slate-500 text-xs">das sessões totais</p>
              </div>
            </div>
          </div>

          {/* Usage Rate */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="bg-violet-50 rounded-xl p-2">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-700 text-sm mb-1">Taxa de Utilização</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-violet-600">59%</span>
                </div>
                <p className="text-slate-500 text-xs">Sessões utilizadas este mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions This Month */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Sessões Este Mês</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-900">234</span>
              </div>
              <p className="text-slate-600 text-sm mt-1">
                de 400 utilizadas
              </p>
            </div>
          </div>
        </div>

        {/* Registration State */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-3xl p-6 mb-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <div className="bg-white/60 rounded-2xl p-3 w-fit mb-3">
              <Users className="w-7 h-7 text-violet-600" />
            </div>
            <h2 className="text-slate-900 mb-2">Estado de Registo</h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-slate-900">47</span>
              <span className="text-slate-700 text-sm">registados,</span>
              <span className="text-slate-900">3</span>
              <span className="text-slate-700 text-sm">pendentes</span>
            </div>
          </div>
        </div>

        {/* Resources Card */}
        <div className="rounded-3xl overflow-hidden shadow-sm relative h-48">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
            alt="Recursos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 w-fit mb-2">
              <div className="w-8 h-8 bg-white rounded-xl" />
            </div>
            <h2 className="text-white mb-1">Recursos</h2>
            <p className="text-white/90 text-sm">
              Conteúdos e materiais de apoio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
