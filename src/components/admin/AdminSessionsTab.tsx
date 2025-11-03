import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, FileText, ClipboardList } from 'lucide-react';
import { LiveIndicator } from '@/components/ui/live-indicator';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { handleError } from '@/utils/errorHandler';

// Mock sessions removed - using real data from database

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  scheduled: 'bg-vibrant-blue/10 text-vibrant-blue dark:text-sky-blue',
  cancelled: 'bg-destructive/10 text-destructive',
};

const pillarColors = {
  'saude_mental': 'bg-blue-100 text-blue-800',
  'bem_estar_fisico': 'bg-yellow-100 text-yellow-800',
  'assistencia_financeira': 'bg-green-100 text-green-800',
  'assistencia_juridica': 'bg-purple-100 text-purple-800',
};

const pillarLabels: Record<string, string> = {
  'saude_mental': 'Saúde Mental',
  'bem_estar_fisico': 'Bem-Estar Físico',
  'assistencia_financeira': 'Assistência Financeira',
  'assistencia_juridica': 'Assistência Jurídica',
};

export default function AdminSessionsTab() {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [sessions, setSessions] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load companies for filter
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (companiesData) {
          setCompanies(companiesData);
        }

        // Load sessions
        const { data, error} = await supabase
          .from('bookings')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data) {
          const formattedSessions = await Promise.all(data.map(async (booking) => {
            // Get user profile
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', booking.user_id)
              .maybeSingle();
            
            // Get company
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', booking.company_id)
              .maybeSingle();
            
            // Get prestador with profile name
            const { data: prestador } = await supabase
              .from('prestadores')
              .select('user_id, profiles(name)')
              .eq('id', booking.prestador_id)
              .maybeSingle();

            return {
              id: booking.id,
              collaborator: userProfile?.name || '',
              company: company?.name || '',
              pillar: booking.pillar,
              specialist: (prestador?.profiles as any)?.name || '',
              date: booking.date,
              time: booking.start_time,
              status: booking.status,
              rating: booking.rating,
              type: booking.meeting_type || 'online'
            };
          }));

          setSessions(formattedSessions);
        }
      } catch (error) {
        handleError(error, {
          title: 'Erro ao carregar sessões',
          fallbackMessage: 'Não foi possível carregar as sessões'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscription
    const subscription = supabase
      .channel('admin-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.collaborator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.specialist?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === 'all' || session.company === companyFilter;
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesPillar = pillarFilter === 'all' || session.pillar === pillarFilter;
    
    return matchesSearch && matchesCompany && matchesStatus && matchesPillar;
  });

  if (loading) {
    return <LoadingSkeleton variant="table" />;
  }

  // Show empty state if no sessions
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma sessão agendada"
        description="As sessões agendadas pelos colaboradores aparecerão aqui. Quando houver atividade na plataforma, poderá gerir e acompanhar todas as sessões."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lista de Sessões
          </div>
          <LiveIndicator />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar colaborador ou especialista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={pillarFilter} onValueChange={setPillarFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Pilar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="saude_mental">Saúde Mental</SelectItem>
              <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
              <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
              <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scheduled">Agendada</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Pilar</TableHead>
                <TableHead>Especialista</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={FileText}
                      title="Nenhuma sessão encontrada"
                      description={statusFilter !== 'all' || pillarFilter !== 'all' || companyFilter !== 'all' || searchTerm
                        ? "Não foram encontradas sessões com os filtros aplicados"
                        : "Ainda não existem sessões registadas"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.collaborator}</TableCell>
                    <TableCell>{session.company}</TableCell>
                    <TableCell>
                      <Badge className={`${pillarColors[session.pillar as keyof typeof pillarColors] || 'bg-gray-100 text-gray-800'} rounded-full px-3 py-1`}>
                        {pillarLabels[session.pillar] || session.pillar}
                      </Badge>
                    </TableCell>
                    <TableCell>{session.specialist}</TableCell>
                    <TableCell>
                      {new Date(session.date).toLocaleDateString('pt-PT')} às {session.time}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {session.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[session.status as keyof typeof statusColors]}>
                        {session.status === 'completed' && 'Concluída'}
                        {session.status === 'scheduled' && 'Agendada'}
                        {session.status === 'cancelled' && 'Cancelada'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
