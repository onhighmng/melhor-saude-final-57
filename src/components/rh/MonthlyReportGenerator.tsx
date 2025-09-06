import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  FileText, 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Calculator,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import CompanyFinalNotes from "./CompanyFinalNotes";

interface CompanyInfo {
  name: string;
  activeEmployees: number;
  reportPeriod: string;
  internalId: string;
}

interface ExecutiveSummary {
  totalSessions: number;
  totalEmployeesServed: number;
  includedServices: number;
  extraServices: number;
  estimatedBilling: number;
}

interface EmployeeDetail {
  name: string;
  internalId: string;
  department: string;
  serviceUsed: string;
  type: 'incluído' | 'extra';
  professional: string;
  date: string;
  duration: number;
  valueInMZN: number;
}

interface ServiceSummary {
  pillar: string;
  sessions: number;
  totalHours: number;
  totalValue: number;
}

interface Anomaly {
  type: 'no-show' | 'off-criteria' | 'monthly-limit-exceeded';
  description: string;
  employee: string;
  date: string;
}

interface UtilizationAnalysis {
  departmentUsage: { department: string; percentage: number; trend: 'up' | 'down' | 'stable' }[];
  averageSatisfaction: number;
}

interface BillingProposal {
  serviceType: string;
  quantity: number;
  unitValue: number;
  subtotal: number;
}

interface MonthlyReportData {
  companyInfo: CompanyInfo;
  executiveSummary: ExecutiveSummary;
  employeeDetails: EmployeeDetail[];
  serviceSummary: ServiceSummary[];
  anomalies: Anomaly[];
  utilizationAnalysis: UtilizationAnalysis;
  billingProposal: BillingProposal[];
  finalObservations: string[];
}

const MonthlyReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { reportService } = await import('@/services/reportService');
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const data = await reportService.getMonthlyReport(month, year);
      
      // Transform the data to match MonthlyReportData interface
      const transformedData: MonthlyReportData = {
        companyInfo: {
          name: 'Empresa Geral',
          activeEmployees: data.totalUsers,
          reportPeriod: `${data.month} ${data.year}`,
          internalId: 'MS-001'
        },
        executiveSummary: {
          totalSessions: data.usersWithBookings + data.usersAttended + data.usersCompleted,
          totalEmployeesServed: data.usersWithBookings,
          includedServices: data.usersCompleted,
          extraServices: 0,
          estimatedBilling: data.usersCompleted * 2500 // Estimated value
        },
        employeeDetails: data.detailedReports.map(report => ({
          name: report.userName,
          internalId: 'EMP-001',
          department: 'N/A',
          serviceUsed: report.sessionType,
          type: 'incluído' as const,
          professional: report.professional,
          date: report.date,
          duration: report.duration,
          valueInMZN: 2500
        })),
        serviceSummary: Object.entries(data.consultationsByCategory).map(([pillar, stats]) => ({
          pillar,
          sessions: stats.booked,
          totalHours: stats.attended,
          totalValue: stats.completed * 2500
        })),
        anomalies: [],
        utilizationAnalysis: {
          departmentUsage: [],
          averageSatisfaction: 4.5
        },
        billingProposal: [
          {
            serviceType: 'Consultas Individuais',
            quantity: data.usersCompleted,
            unitValue: 2500,
            subtotal: data.usersCompleted * 2500
          }
        ],
        finalObservations: ['Relatório gerado automaticamente com base nos dados do sistema.']
      };
      
      setReportData(transformedData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback to empty data
      setReportData({
        companyInfo: {
          name: "N/A",
          activeEmployees: 0,
          reportPeriod: "N/A",
          internalId: "N/A"
        },
        executiveSummary: {
          totalSessions: 0,
          totalEmployeesServed: 0,
          includedServices: 0,
          extraServices: 0,
          estimatedBilling: 0
        },
        employeeDetails: [],
        serviceSummary: [],
        anomalies: [],
        utilizationAnalysis: {
          departmentUsage: [],
          averageSatisfaction: 0
        },
        billingProposal: [],
        finalObservations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsGenerating(true);
    
    // Generate CSV content
    const csvContent = [
      // Header
      'Relatório Mensal - Melhor Saúde',
      `Empresa: ${reportData.companyInfo.name}`,
      `Período: ${reportData.companyInfo.reportPeriod}`,
      `Colaboradores Ativos: ${reportData.companyInfo.activeEmployees}`,
      '',
      'Detalhe por Colaborador',
      'Nome,ID Interno,Departamento,Serviço,Tipo,Profissional,Data,Duração (min),Valor (MZN)',
      ...reportData.employeeDetails.map(emp => 
        `${emp.name},${emp.internalId},${emp.department},${emp.serviceUsed},${emp.type},${emp.professional},${emp.date},${emp.duration},${emp.valueInMZN}`
      ),
      '',
      'Resumo por Tipo de Serviço',
      'Pilar,Sessões,Horas Totais,Valor Total',
      ...reportData.serviceSummary.map(service => 
        `${service.pillar},${service.sessions},${service.totalHours},${service.totalValue}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-mensal-${reportData.companyInfo.reportPeriod.replace(' ', '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    
    // In a real app, this would generate a proper PDF
    // For now, we'll create a printable HTML version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório Mensal - ${reportData.companyInfo.reportPeriod}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .section h2 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .metric-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório Mensal – Melhor Saúde</h1>
              <h2>${reportData.companyInfo.reportPeriod}</h2>
            </div>
            
            <div class="section">
              <h2>Identificação do Cliente</h2>
              <p><strong>Empresa:</strong> ${reportData.companyInfo.name}</p>
              <p><strong>Colaboradores Ativos:</strong> ${reportData.companyInfo.activeEmployees}</p>
              <p><strong>Período:</strong> ${reportData.companyInfo.reportPeriod}</p>
            </div>

            <div class="section">
              <h2>Sumário Executivo</h2>
              <div class="summary-grid">
                <div class="metric-card">
                  <strong>Total de Atendimentos:</strong> ${reportData.executiveSummary.totalSessions}
                </div>
                <div class="metric-card">
                  <strong>Colaboradores Atendidos:</strong> ${reportData.executiveSummary.totalEmployeesServed}
                </div>
                <div class="metric-card">
                  <strong>Serviços Incluídos:</strong> ${reportData.executiveSummary.includedServices}
                </div>
                <div class="metric-card">
                  <strong>Serviços Extra:</strong> ${reportData.executiveSummary.extraServices}
                </div>
              </div>
              <p><strong>Valor Estimado de Faturação:</strong> ${reportData.executiveSummary.estimatedBilling.toLocaleString()} MZN</p>
            </div>

            <div class="section">
              <h2>Detalhe por Colaborador</h2>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>ID Interno</th>
                    <th>Departamento</th>
                    <th>Serviço</th>
                    <th>Tipo</th>
                    <th>Profissional</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th>Valor (MZN)</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.employeeDetails.map(emp => `
                    <tr>
                      <td>${emp.name}</td>
                      <td>${emp.internalId}</td>
                      <td>${emp.department}</td>
                      <td>${emp.serviceUsed}</td>
                      <td>${emp.type}</td>
                      <td>${emp.professional}</td>
                      <td>${new Date(emp.date).toLocaleDateString('pt-PT')}</td>
                      <td>${emp.duration}min</td>
                      <td>${emp.valueInMZN.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>Resumo por Tipo de Serviço</h2>
              <table>
                <thead>
                  <tr>
                    <th>Pilar</th>
                    <th>Sessões</th>
                    <th>Horas Totais</th>
                    <th>Valor Total (MZN)</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.serviceSummary.map(service => `
                    <tr>
                      <td>${service.pillar}</td>
                      <td>${service.sessions}</td>
                      <td>${service.totalHours}h</td>
                      <td>${service.totalValue.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>Proposta de Faturação</h2>
              <table>
                <thead>
                  <tr>
                    <th>Tipo de Serviço</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.billingProposal.map(item => `
                    <tr>
                      <td>${item.serviceType}</td>
                      <td>${item.quantity}</td>
                      <td>${item.unitValue.toLocaleString()} MZN</td>
                      <td>${item.subtotal.toLocaleString()} MZN</td>
                    </tr>
                  `).join('')}
                  <tr style="font-weight: bold;">
                    <td colspan="3">TOTAL A FATURAR</td>
                    <td>${reportData.billingProposal.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()} MZN</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>Observações Finais</h2>
              <ul>
                ${reportData.finalObservations.map(obs => `<li>${obs}</li>`).join('')}
              </ul>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case 'no-show': return 'bg-warm-orange/20 text-warm-orange border-warm-orange/30';
      case 'off-criteria': return 'bg-vibrant-blue/20 text-vibrant-blue border-vibrant-blue/30';
      case 'monthly-limit-exceeded': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-slate-grey/20 text-slate-grey border-slate-grey/30';
    }
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-grey">Carregando dados do relatório...</p>
        </div>
      ) : !reportData ? (
        <div className="text-center py-8">
          <p className="text-slate-grey">Erro ao carregar dados do relatório.</p>
        </div>
      ) : (
        <>
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-navy-blue mb-2">Relatório Mensal – Melhor Saúde</h2>
          <p className="text-slate-grey">{reportData.companyInfo.reportPeriod}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportCSV}
            disabled={isGenerating}
            className="bg-emerald-green hover:bg-emerald-green/90 text-white"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar CSV/Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="bg-royal-blue hover:bg-navy-blue text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Company Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Identificação do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-grey">Empresa</p>
              <p className="font-semibold text-navy-blue">{reportData.companyInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-grey">Colaboradores Ativos</p>
              <p className="font-semibold text-navy-blue">{reportData.companyInfo.activeEmployees}</p>
            </div>
            <div>
              <p className="text-sm text-slate-grey">Período de Referência</p>
              <p className="font-semibold text-navy-blue">{reportData.companyInfo.reportPeriod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Sumário Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-accent-sage/5 to-vibrant-blue/5 rounded-lg">
              <p className="text-2xl font-bold text-navy-blue">{reportData.executiveSummary.totalSessions}</p>
              <p className="text-sm text-slate-grey">Total Atendimentos</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-vibrant-blue/5 to-emerald-green/5 rounded-lg">
              <p className="text-2xl font-bold text-navy-blue">{reportData.executiveSummary.totalEmployeesServed}</p>
              <p className="text-sm text-slate-grey">Colaboradores Atendidos</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-green/5 to-accent-sage/5 rounded-lg">
              <p className="text-2xl font-bold text-navy-blue">{reportData.executiveSummary.includedServices}</p>
              <p className="text-sm text-slate-grey">Serviços Incluídos</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-warm-orange/5 to-vibrant-blue/5 rounded-lg">
              <p className="text-2xl font-bold text-navy-blue">{reportData.executiveSummary.extraServices}</p>
              <p className="text-sm text-slate-grey">Serviços Extra</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-royal-blue/5 to-navy-blue/5 rounded-lg">
              <p className="text-2xl font-bold text-navy-blue">{(reportData.executiveSummary.estimatedBilling / 1000).toFixed(0)}k</p>
              <p className="text-sm text-slate-grey">Faturação (MZN)</p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Service Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Resumo por Tipo de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportData.serviceSummary.map((service, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-accent-sage/5 to-vibrant-blue/5 border border-accent-sage/20">
                <h4 className="font-semibold text-navy-blue mb-3">{service.pillar}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-grey">Sessões:</span>
                    <span className="font-medium text-navy-blue">{service.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-grey">Horas Totais:</span>
                    <span className="font-medium text-navy-blue">{service.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-grey">Valor Total:</span>
                    <span className="font-medium text-navy-blue">{(service.totalValue / 1000).toFixed(0)}k MZN</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Observações / Anomalias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-grey/20">
                <div>
                  <Badge className={getAnomalyColor(anomaly.type)}>
                    {anomaly.type.replace('-', ' ')}
                  </Badge>
                  <p className="text-sm text-slate-grey mt-1">{anomaly.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-navy-blue">{anomaly.employee}</p>
                  <p className="text-sm text-slate-grey">{new Date(anomaly.date).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utilization Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Análise de Utilização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-navy-blue mb-3">% de Uso por Departamento</h4>
              <div className="space-y-3">
                {reportData.utilizationAnalysis.departmentUsage.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-grey">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy-blue">{dept.percentage}%</span>
                      <span className={`text-sm ${dept.trend === 'up' ? 'text-emerald-green' : dept.trend === 'down' ? 'text-warm-orange' : 'text-slate-grey'}`}>
                        {getTrendIcon(dept.trend)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-navy-blue mb-3">Satisfação Média</h4>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-green/5 to-vibrant-blue/5 rounded-lg">
                <div className="text-3xl font-bold text-navy-blue">{reportData.utilizationAnalysis.averageSatisfaction}</div>
                <div className="text-sm text-slate-grey">de 5 estrelas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Final Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Observações Finais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyFinalNotes companyName={reportData.companyInfo.name} />
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

export default MonthlyReportGenerator;