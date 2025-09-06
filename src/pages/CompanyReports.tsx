import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  FileText,
  Mail
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";

const pillarUsageData = [
  { name: "Saúde Mental", sessions: 142, noShows: 8, color: "#3B82F6" },
  { name: "Bem-estar Físico", sessions: 89, noShows: 5, color: "#10B981" },
  { name: "Assist. Financeira", sessions: 67, noShows: 2, color: "#F59E0B" },
  { name: "Assist. Jurídica", sessions: 23, noShows: 1, color: "#8B5CF6" }
];

const departmentData = [
  { department: "Tecnologia", employees: 45, adoptionRate: 89, averageSessions: 8.2 },
  { department: "Marketing", employees: 23, adoptionRate: 76, averageSessions: 6.1 },
  { department: "Recursos Humanos", employees: 12, adoptionRate: 94, averageSessions: 9.8 },
  { department: "Vendas", employees: 38, adoptionRate: 65, averageSessions: 4.7 },
  { department: "Operações", employees: 29, adoptionRate: 72, averageSessions: 5.9 }
];

const monthlyTrends = [
  { month: "Jan", sessions: 245, adoption: 68 },
  { month: "Fev", sessions: 289, adoption: 72 },
  { month: "Mar", sessions: 321, adoption: 76 },
  { month: "Abr", sessions: 298, adoption: 78 },
  { month: "Mai", sessions: 342, adoption: 82 },
  { month: "Jun", sessions: 387, adoption: 85 }
];

interface Report {
  id: string;
  name: string;
  description: string;
  type: "usage" | "adoption" | "satisfaction" | "financial";
  frequency: "weekly" | "monthly" | "quarterly";
  lastGenerated: string;
}

const availableReports: Report[] = [
  {
    id: "1",
    name: "Relatório de Utilização por Pilar",
    description: "Distribuição de sessões por área de wellbeing",
    type: "usage",
    frequency: "monthly",
    lastGenerated: "2024-01-15"
  },
  {
    id: "2",
    name: "Taxa de Adesão por Departamento",
    description: "Percentagem de colaboradores que utilizaram pelo menos uma sessão",
    type: "adoption", 
    frequency: "monthly",
    lastGenerated: "2024-01-15"
  },
  {
    id: "3",
    name: "Análise de Satisfação",
    description: "Feedback e avaliações dos colaboradores sobre os serviços",
    type: "satisfaction",
    frequency: "quarterly",
    lastGenerated: "2024-01-01"
  },
  {
    id: "4",
    name: "Custos e ROI do Programa",
    description: "Análise financeira do investimento em wellbeing",
    type: "financial",
    frequency: "quarterly",
    lastGenerated: "2024-01-01"
  }
];

const CompanyReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);

  const handleGenerateReport = (reportId: string, format: "csv" | "pdf") => {
    // In a real app, this would generate the actual report
    const report = availableReports.find(r => r.id === reportId);
    console.log(`Generating ${format.toUpperCase()} report:`, report?.name);
    
    toast({
      title: "Relatório gerado",
      description: `${report?.name} foi exportado em formato ${format.toUpperCase()}`,
    });
  };

  const handleScheduleReport = (reportId: string) => {
    const report = availableReports.find(r => r.id === reportId);
    console.log("Scheduling report:", report?.name);
    
    toast({
      title: "Relatório agendado",
      description: `${report?.name} será enviado automaticamente por email`,
    });
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "usage": return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case "adoption": return <Users className="h-5 w-5 text-green-600" />;
      case "satisfaction": return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case "financial": return <PieChart className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Relatórios & Analytics
            </h1>
            <p className="text-muted-foreground">
              Análise detalhada da utilização e impacto do programa de wellbeing
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border z-50">
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pillar Usage Chart */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Utilização por Pilar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pillarUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="sessions" fill="#3B82F6" name="Sessões" />
                  <Bar dataKey="noShows" fill="#EF4444" name="Faltas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Adoption */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Adesão por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="department" type="category" stroke="#888" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      name === 'adoptionRate' ? `${value}%` : value,
                      name === 'adoptionRate' ? 'Taxa Adesão' : name === 'employees' ? 'Colaboradores' : 'Média Sessões'
                    ]}
                  />
                  <Bar dataKey="adoptionRate" fill="#10B981" name="Taxa de Adesão (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tendências Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                  name="Sessões Totais"
                />
                <Line 
                  type="monotone" 
                  dataKey="adoption" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                  name="Taxa de Adesão (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availableReports.map((report) => (
                <Card key={report.id} className="border border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getReportIcon(report.type)}
                        <div>
                          <h3 className="font-semibold text-sm">{report.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Frequência: {report.frequency}</span>
                      <span>Último: {new Date(report.lastGenerated).toLocaleDateString('pt-PT')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateReport(report.id, "csv")}
                        className="text-xs h-7"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateReport(report.id, "pdf")}
                        className="text-xs h-7"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleReport(report.id)}
                        className="text-xs h-7"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Details Table */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Detalhes por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Departamento</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Colaboradores</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Taxa Adesão</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Média Sessões</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{dept.department}</td>
                      <td className="p-4">{dept.employees}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${dept.adoptionRate >= 80 ? 'text-green-600' : dept.adoptionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {dept.adoptionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{dept.averageSessions}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dept.adoptionRate >= 80 ? 'bg-green-100 text-green-800' :
                          dept.adoptionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dept.adoptionRate >= 80 ? 'Excelente' :
                           dept.adoptionRate >= 60 ? 'Bom' : 'Necessita atenção'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyReports;