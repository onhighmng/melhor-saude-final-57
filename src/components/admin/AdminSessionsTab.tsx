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
import { Search, Filter } from 'lucide-react';

// Mock sessions removed - using real data from database

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  scheduled: 'bg-vibrant-blue/10 text-vibrant-blue dark:text-sky-blue',
  cancelled: 'bg-destructive/10 text-destructive',
};

const pillarColors = {
  'Saúde Mental': 'bg-blue-100 text-blue-800',
  'Bem-Estar Físico': 'bg-yellow-100 text-yellow-800',
  'Assistência Financeira': 'bg-green-100 text-green-800',
  'Assistência Jurídica': 'bg-purple-100 text-purple-800',
};

export default function AdminSessionsTab() {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const { data, error} = await supabase
          .from('bookings')
          .select('*')
          .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedSessions = await Promise.all(data.map(async (booking) => {
            // Get user profile
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', booking.user_id)
              .single();
            
            // Get company
            const { data: company } = await supabase
              .from('companies')
              .select('company_name')
              .eq('id', booking.company_id)
              .single();
            
            // Get prestador
            const { data: prestador } = await supabase
              .from('prestadores')
              .select('name')
              .eq('id', booking.prestador_id)
              .single();

            return {
              id: booking.id,
              collaborator: userProfile?.name || '',
              company: company?.company_name || '',
              pillar: booking.pillar,
              specialist: prestador?.name || '',
              date: booking.date,
              time: booking.start_time,
              status: booking.status,
              rating: booking.rating
            };
          }));

          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast.error('Erro ao carregar sessões');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();

    // Real-time subscription
    const subscription = supabase
      .channel('admin-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => {
        loadSessions();
      })
      .subscribe();

    return () => subscription.unsubscribe();
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Lista de Sessões
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
              <SelectItem value="Tech Corp">Tech Corp</SelectItem>
              <SelectItem value="Innovation Ltd">Innovation Ltd</SelectItem>
              <SelectItem value="StartUp Inc">StartUp Inc</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pillarFilter} onValueChange={setPillarFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Pilar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Saúde Mental">Saúde Mental</SelectItem>
              <SelectItem value="Bem-Estar Físico">Bem-Estar Físico</SelectItem>
              <SelectItem value="Assistência Financeira">Assistência Financeira</SelectItem>
              <SelectItem value="Assistência Jurídica">Assistência Jurídica</SelectItem>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma sessão encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.collaborator}</TableCell>
                    <TableCell>{session.company}</TableCell>
                    <TableCell>
                      <Badge className={`${pillarColors[session.pillar as keyof typeof pillarColors]} rounded-full px-3 py-1`}>
                        {session.pillar}
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
