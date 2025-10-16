import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AddEmployeeModal } from '@/components/admin/AddEmployeeModal';
import { 
  Search, 
  Eye, 
  Brain,
  Dumbbell,
  DollarSign,
  Scale,
  Star,
  Calendar,
  Plus
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  company: string;
  pillars: string[];
  progress: number;
  totalSessions: number;
  completedSessions: number;
  avgRating: number;
  goals: string[];
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techcorp.pt',
    company: 'TechCorp Lda',
    pillars: ['Saúde Mental', 'Bem-Estar Físico'],
    progress: 75,
    totalSessions: 12,
    completedSessions: 9,
    avgRating: 4.8,
    goals: ['Reduzir stress', 'Melhorar condição física']
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@healthplus.pt',
    company: 'HealthPlus SA',
    pillars: ['Saúde Mental', 'Assistência Jurídica'],
    progress: 60,
    totalSessions: 8,
    completedSessions: 5,
    avgRating: 4.5,
    goals: ['Gestão de ansiedade', 'Questões contratuais']
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos@startup.pt',
    company: 'StartupHub',
    pillars: ['Assistência Financeira'],
    progress: 40,
    totalSessions: 5,
    completedSessions: 2,
    avgRating: 4.2,
    goals: ['Planeamento financeiro']
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@consultpro.pt',
    company: 'ConsultPro',
    pillars: ['Saúde Mental', 'Bem-Estar Físico', 'Assistência Financeira'],
    progress: 85,
    totalSessions: 20,
    completedSessions: 17,
    avgRating: 4.9,
    goals: ['Equilíbrio vida-trabalho', 'Poupança reforma', 'Nutrição']
  },
];

const pillarIcons: Record<string, any> = {
  'Saúde Mental': Brain,
  'Bem-Estar Físico': Dumbbell,
  'Assistência Financeira': DollarSign,
  'Assistência Jurídica': Scale,
};

const pillarColors: Record<string, string> = {
  'Saúde Mental': 'bg-mint-green/10 text-mint-green',
  'Bem-Estar Físico': 'bg-royal-blue/10 text-royal-blue',
  'Assistência Financeira': 'bg-peach-orange/10 text-peach-orange',
  'Assistência Jurídica': 'bg-sky-blue/10 text-sky-blue',
};

export const AdminEmployeesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSheetOpen(true);
  };

  const handleAddEmployee = () => {
    setIsAddEmployeeModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Colaboradores</h2>
            <p className="text-sm text-muted-foreground">Gerir colaboradores e acompanhar progresso</p>
          </div>
          
          <Button onClick={handleAddEmployee} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Colaborador
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar colaboradores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Empresa</p>
                  <p className="font-medium text-sm">{employee.company}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pilares</p>
                  <div className="flex flex-wrap gap-2">
                    {employee.pillars.map((pillar) => {
                      const Icon = pillarIcons[pillar];
                      return (
                        <Badge 
                          key={pillar} 
                          variant="outline" 
                          className={pillarColors[pillar]}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {pillar}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="text-sm font-medium">{employee.progress}%</p>
                  </div>
                  <Progress value={employee.progress} className="h-2" />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewProfile(employee)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedEmployee && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{selectedEmployee.name}</SheetTitle>
                    <SheetDescription>{selectedEmployee.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-vibrant-blue/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-vibrant-blue" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sessões</p>
                          <p className="text-2xl font-bold">
                            {selectedEmployee.completedSessions}/{selectedEmployee.totalSessions}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-peach-orange/10 rounded-lg">
                          <Star className="h-5 w-5 text-peach-orange" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avaliação</p>
                          <p className="text-2xl font-bold">{selectedEmployee.avgRating}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Objetivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedEmployee.goals.map((goal, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Session History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: '15/01/2025', pillar: 'Saúde Mental', provider: 'Dra. Maria Santos' },
                        { date: '08/01/2025', pillar: 'Bem-Estar Físico', provider: 'Prof. Ana Rodrigues' },
                        { date: '22/12/2024', pillar: 'Saúde Mental', provider: 'Dra. Maria Santos' },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium text-sm">{session.pillar}</p>
                            <p className="text-xs text-muted-foreground">{session.provider}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">{session.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddEmployeeModalOpen}
        onOpenChange={setIsAddEmployeeModalOpen}
      />
    </>
  );
};
