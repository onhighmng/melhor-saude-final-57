import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Mock data
const mockSessions = [
  {
    id: '1',
    collaborator: 'Ana Silva',
    company: 'Tech Corp',
    pillar: 'Saúde Mental',
    specialist: 'Dr. João Costa',
    date: '2025-10-15',
    time: '10:00',
    status: 'completed',
    type: 'virtual'
  },
  {
    id: '2',
    collaborator: 'Carlos Santos',
    company: 'Innovation Ltd',
    pillar: 'Bem-Estar Físico',
    specialist: 'Dra. Maria Oliveira',
    date: '2025-10-16',
    time: '14:30',
    status: 'scheduled',
    type: 'presencial'
  },
  {
    id: '3',
    collaborator: 'Beatriz Ferreira',
    company: 'Tech Corp',
    pillar: 'Assistência Financeira',
    specialist: 'Dr. Pedro Alves',
    date: '2025-10-14',
    time: '11:00',
    status: 'cancelled',
    type: 'virtual'
  },
  {
    id: '4',
    collaborator: 'Daniel Rocha',
    company: 'StartUp Inc',
    pillar: 'Assistência Jurídica',
    specialist: 'Dra. Sofia Martins',
    date: '2025-10-17',
    time: '09:00',
    status: 'scheduled',
    type: 'virtual'
  },
];

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  scheduled: 'bg-vibrant-blue/10 text-vibrant-blue dark:text-sky-blue',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function AdminSessionsTab() {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.collaborator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.specialist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === 'all' || session.company === companyFilter;
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesPillar = pillarFilter === 'all' || session.pillar === pillarFilter;
    
    return matchesSearch && matchesCompany && matchesStatus && matchesPillar;
  });

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
                    <TableCell>{session.pillar}</TableCell>
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
