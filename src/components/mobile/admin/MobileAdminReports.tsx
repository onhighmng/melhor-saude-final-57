import { useState } from 'react';
import { FileText, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileAdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reports = [
    {
      id: 1,
      title: 'Relatório de Uso Mensal',
      description: 'Análise completa de utilização de serviços',
      date: '2025-10-31',
      type: 'usage',
      status: 'ready'
    },
    {
      id: 2,
      title: 'Relatório Financeiro Q4',
      description: 'Receitas e despesas do trimestre',
      date: '2025-10-31',
      type: 'financial',
      status: 'ready'
    },
    {
      id: 3,
      title: 'Satisfação dos Utilizadores',
      description: 'Feedback e avaliações de Outubro',
      date: '2025-10-31',
      type: 'feedback',
      status: 'ready'
    }
  ];

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
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
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

        {/* Reports List */}
        <div className="space-y-3">
          {reports.map((report) => (
            <Card 
              key={report.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{report.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {new Date(report.date).toLocaleDateString('pt-PT')}
                    </span>
                    <Badge variant="default" className="text-xs">
                      Pronto
                    </Badge>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

