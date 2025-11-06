import { useState } from 'react';
import { FileText, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileAdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Reports are generated on-demand from desktop
  // No persistent reports table exists in the database

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-500 text-sm">Relatórios e análises da plataforma</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Period Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'quarter' && 'Trimestre'}
              {period === 'year' && 'Ano'}
            </button>
          ))}
        </div>

        {/* Note about on-demand generation */}
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Geração de Relatórios</h3>
          <p className="text-gray-600 text-sm mb-4 px-4">
            Os relatórios detalhados de faturação, métricas internas e relatórios para empresas são gerados sob demanda.
          </p>
          <p className="text-gray-500 text-xs px-4">
            Aceda à versão desktop para gerar e descarregar relatórios completos com filtros avançados e exportação de dados.
          </p>
          <div className="mt-6 space-y-2 px-4">
            <Card className="bg-blue-50 rounded-2xl p-4 border-none text-left">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Faturação</p>
                  <p className="text-xs text-gray-600 mt-0.5">Gestão de faturas e pagamentos</p>
                </div>
              </div>
            </Card>
            <Card className="bg-green-50 rounded-2xl p-4 border-none text-left">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Relatórios Internos</p>
                  <p className="text-xs text-gray-600 mt-0.5">Métricas e análises da plataforma</p>
                </div>
              </div>
            </Card>
            <Card className="bg-purple-50 rounded-2xl p-4 border-none text-left">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Relatórios para Empresas</p>
                  <p className="text-xs text-gray-600 mt-0.5">Análises personalizadas por empresa</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

