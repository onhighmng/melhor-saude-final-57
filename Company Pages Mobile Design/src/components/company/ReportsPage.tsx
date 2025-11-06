import { FileText, Users, Calendar, Star, TrendingUp, ChevronDown } from 'lucide-react';

export function ReportsPage() {
  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2 text-center">Relatórios e Impacto</h1>
          <p className="text-slate-600 text-center text-sm">
            Avalie localmente do bem-estar dos colaboradores e impacto dos programas
          </p>
        </div>

        {/* Month Selector */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-blue-900 text-sm">Plano de 3 Meses - 1 clínicas - 3 profissionais - 48 frequências</span>
        </div>

        {/* Export Report Button */}
        <div className="mb-6">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm">
            <FileText className="w-5 h-5" />
            <span>Exportar Relatório Mensal</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Colaboradores Ativos */}
          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 text-sm">Colaboradores Ativos</span>
            </div>
            <div className="text-slate-900">1</div>
          </div>

          {/* Sessões Realizadas */}
          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 text-sm">Sessões Realizadas</span>
            </div>
            <div className="text-slate-900">0</div>
          </div>

          {/* Satisfação Média */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 text-sm">Satisfação Média</span>
            </div>
            <div className="text-slate-900">0/10</div>
          </div>

          {/* Taxa de Utilização */}
          <div className="bg-violet-50 rounded-3xl p-5 border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              <span className="text-slate-700 text-sm">Taxa de Utilização</span>
            </div>
            <div className="text-slate-900">0%</div>
          </div>
        </div>

        {/* Distribuição por Pilar */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <h2 className="text-slate-900 mb-4">Distribuição por Pilar</h2>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="bg-slate-50 rounded-full p-6 mb-3 inline-block">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Sem dados de distribuição</p>
              <p className="text-slate-400 text-xs mt-1">Os dados aparecerão após as primeiras sessões</p>
            </div>
          </div>
        </div>

        {/* Destaques do Período */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 rounded-xl p-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-slate-900">Destaques do Período</h2>
          </div>

          {/* Pilar Mais Utilizado */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 text-sm">Pilar Mais Utilizado</h3>
              <button className="text-blue-600 text-sm flex items-center gap-1">
                Ver sessões
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-slate-400 mb-2">N/A</div>
                <p className="text-slate-400 text-xs">Sem dados disponíveis</p>
              </div>
            </div>
          </div>

          {/* Satisfação dos Colaboradores */}
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="text-slate-700 text-sm mb-4">Satisfação dos Colaboradores</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-500 text-xs mb-1">Avaliação Média</div>
                <div className="text-slate-900">0/10</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Ato Instituição</div>
                <div className="text-slate-900">0%</div>
                <div className="text-slate-500 text-xs">0 de 0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
