import { FileText, Heart, DollarSign, Scale, BookOpen, Calendar } from 'lucide-react';

export function SessionsPage() {
  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-slate-900 mb-1">Sessões</h1>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-2 px-4 flex items-center gap-2 transition-colors shadow-sm text-sm">
            <FileText className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>

        {/* Sessions Dashboard Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-blue-50 rounded-2xl p-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Sessões Contratadas</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-slate-900">400</span>
              </div>
              <p className="text-slate-600 text-sm">Distribuídas no contrato</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <h3 className="text-slate-900 mb-3">Dashboard Intuitivo de Sessões</h3>
            <p className="text-slate-600 text-sm mb-4">
              Visualize métricas de utilização com gráficos elegantes que fornecem insights acionáveis em tempo real.
            </p>
          </div>
        </div>

        {/* Integrated Wellness Pillars */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-slate-100">
          <div className="mb-4">
            <h2 className="text-slate-900 mb-2">Pilares de Bem-Estar Integrados</h2>
            <p className="text-slate-600 text-sm">
              Acesso completo a todos os pilares de saúde numa única plataforma centralizada e eficiente.
            </p>
          </div>

          <div className="space-y-3">
            {/* Mental Health */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm mb-0.5">Saúde Mental</h3>
                <p className="text-slate-600 text-xs">48 de em sessões</p>
              </div>
              <div className="bg-blue-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-blue-600">94%</span>
              </div>
            </div>

            {/* Physical Wellness */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <Heart className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm mb-0.5">Bem-Estar Físico</h3>
                <p className="text-slate-600 text-xs">46 de em sessões</p>
              </div>
              <div className="bg-amber-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-amber-600">66%</span>
              </div>
            </div>

            {/* Financial Assistance */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm mb-0.5">Assistência Financeira</h3>
                <p className="text-slate-600 text-xs">42 de em sessões</p>
              </div>
              <div className="bg-emerald-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-emerald-600">43%</span>
              </div>
            </div>

            {/* Legal Assistance */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-white/60 rounded-xl p-3 shrink-0">
                <Scale className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 text-sm mb-0.5">Assistência Jurídica</h3>
                <p className="text-slate-600 text-xs">48 de em Saúde</p>
              </div>
              <div className="bg-violet-600/10 rounded-xl px-3 py-1.5 shrink-0">
                <span className="text-violet-600">94%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Sessions Used */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="text-center mb-3">
              <div className="text-slate-900 mb-1">400</div>
              <p className="text-slate-600 text-sm">Sessões Contratadas</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 mb-1">234</div>
              <p className="text-slate-600 text-sm">Sessões Utilizadas</p>
            </div>
          </div>

          {/* Active Collaborators */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="text-center mb-3">
              <div className="text-orange-500 mb-1">58,5%</div>
              <p className="text-slate-600 text-sm">Taxa Utilização</p>
            </div>
            <div className="text-center">
              <div className="text-violet-600 mb-1">42</div>
              <p className="text-slate-600 text-sm">Colaboradores Ativos</p>
            </div>
          </div>
        </div>

        {/* Financial Stability Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-emerald-50 rounded-2xl p-3">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Estabilidade Financeira</h2>
              <p className="text-slate-600 text-sm">
                Consultoria financeira profissional para planeamento patrimonial, gestão de dívidas e construção de um futuro financeiro seguro.
              </p>
            </div>
          </div>
          <div className="bg-emerald-500 rounded-full h-1.5 w-full" />
        </div>
      </div>
    </div>
  );
}
