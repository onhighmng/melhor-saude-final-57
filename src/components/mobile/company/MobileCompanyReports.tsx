import { useState } from 'react';
import { FileText, Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileCompanyReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-500 text-sm">Análises e métricas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['week', 'month', 'quarter'].map((period) => (
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
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">87%</p>
            <p className="text-xs text-gray-600">Taxa de Satisfação</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">120</p>
            <p className="text-xs text-gray-600">Colaboradores Ativos</p>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          <Card className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-medium">Relatório Mensal</h3>
                <p className="text-gray-500 text-sm mt-1">Outubro 2025</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="text-xs">Disponível</Badge>
                </div>
              </div>
              <button className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}

