import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AddEmployeeModal } from '@/components/admin/AddEmployeeModal';
import { InfoCard } from '@/components/ui/info-card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

// Session History Component
const SessionHistoryCard = ({ employeeId }: { employeeId: string }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            prestadores:prestador_id (
              profiles:user_id (name)
            )
          `)
          .eq('user_id', employeeId)
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedSessions = (data || []).map(booking => ({
          date: booking.date,
          pillar: booking.pillar,
          provider: booking.prestadores?.profiles?.name || 'N/A'
        }));

        setSessions(formattedSessions);
      } catch (error) {
        console.error('Error loading session history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadSessionHistory();
    }
  }, [employeeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhuma sessão concluída</div>
          ) : (
            sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{session.pillar}</p>
                  <p className="text-xs text-muted-foreground">{session.provider}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(session.date).toLocaleDateString('pt-PT')}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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

// Mock employees removed - using real data from database

const pillarIcons: Record<string, any> = {
  'Saúde Mental': Brain,
  'Bem-Estar Físico': Dumbbell,
  'Assistência Financeira': DollarSign,
  'Assistência Jurídica': Scale,
};

const pillarColors: Record<string, string> = {
  'Saúde Mental': 'bg-blue-100 text-blue-700 border-blue-200',
  'Bem-Estar Físico': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Assistência Financeira': 'bg-green-100 text-green-700 border-green-200',
  'Assistência Jurídica': 'bg-purple-100 text-purple-700 border-purple-200',
};

export const AdminEmployeesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('company_employees')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              email,
              avatar_url,
              role
            ),
            companies:company_id (
              name
            )
          `)
          .order('joined_at', { ascending: false });

        if (error) throw error;

        const formattedEmployees = await Promise.all(
          data.map(async (emp) => {
            // Get pillar preferences from onboarding
            const { data: onboarding } = await supabase
              .from('onboarding_data')
              .select('pillar_preferences')
              .eq('user_id', emp.user_id)
              .single();

            // Get session count
            const { count: sessionCount } = await supabase
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', emp.user_id)
              .eq('status', 'completed');

            // Get progress
            const { count: progressCount } = await supabase
              .from('user_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', emp.user_id);

            // Calculate progress percentage
            const progress = emp.sessions_allocated > 0
              ? Math.round((sessionCount || 0) / emp.sessions_allocated * 100)
              : 0;

            return {
              id: emp.id,
              name: emp.profiles?.name || '',
              email: emp.profiles?.email || '',
              company: emp.companies?.name || '',
              pillars: onboarding?.pillar_preferences || [],
              sessionsUsed: emp.sessions_used,
              sessionsAllocated: emp.sessions_allocated,
              progress,
              completedSessions: sessionCount || 0,
              totalSessions: emp.sessions_allocated,
              avgRating: 0, // Calculate from bookings.rating if needed
              goals: [] // Load from onboarding_data.main_goals if available
            };
          })
        );

        setEmployees(formattedEmployees);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast.error('Erro ao carregar colaboradores');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <InfoCard
              key={employee.id}
              name={employee.name}
              title={employee.email}
              company={employee.company}
              pillars={employee.pillars}
              completedSessions={employee.completedSessions}
              totalSessions={employee.totalSessions}
              rating={employee.avgRating}
              isPremium={employee.avgRating >= 4.5}
              variant="default"
              type="employee"
              onView={() => handleViewProfile(employee)}
              className="w-full"
            />
          ))}
        </div>

        {/* Profile Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-gray-100">
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
                <SessionHistoryCard employeeId={selectedEmployee.id} />
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

      </div>
    </>
  );
};
