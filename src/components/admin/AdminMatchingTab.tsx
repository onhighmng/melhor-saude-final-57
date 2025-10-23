import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, Bot, UserCog, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockPendingCases = [
  {
    id: '1',
    collaborator: 'Ana Silva',
    company: 'Tech Corp',
    pillar: 'Saúde Mental',
    origin: 'Bot',
    priority: 'high',
    requestDate: '2025-10-13 09:30',
    symptoms: 'Ansiedade, insónia',
  },
  {
    id: '2',
    collaborator: 'Carlos Santos',
    company: 'Innovation Ltd',
    pillar: 'Bem-Estar Físico',
    origin: 'Profissional de Permanencia',
    priority: 'medium',
    requestDate: '2025-10-13 10:15',
    symptoms: 'Dores nas costas',
  },
  {
    id: '3',
    collaborator: 'Beatriz Ferreira',
    company: 'StartUp Inc',
    pillar: 'Assistência Financeira',
    origin: 'Bot',
    priority: 'low',
    requestDate: '2025-10-13 11:00',
    symptoms: 'Planeamento orçamental',
  },
];

const mockSpecialists = [
  { id: '1', name: 'Dr. João Costa', specialty: 'Saúde Mental' },
  { id: '2', name: 'Dra. Maria Oliveira', specialty: 'Bem-Estar Físico' },
  { id: '3', name: 'Dr. Pedro Alves', specialty: 'Assistência Financeira' },
  { id: '4', name: 'Dra. Sofia Martins', specialty: 'Assistência Jurídica' },
];

const priorityColors = {
  high: 'bg-red-500/10 text-red-700 dark:text-red-400',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

export default function AdminMatchingTab() {
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAssign = () => {
    if (!selectedSpecialist) return;
    
    toast({
      title: 'Especialista atribuído',
      description: 'O caso foi atribuído com sucesso ao especialista selecionado.',
    });
    
    setIsDialogOpen(false);
    setSelectedCase(null);
    setSelectedSpecialist('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Casos Pendentes de Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Pilar</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Data Pedido</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPendingCases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell className="font-medium">{case_.collaborator}</TableCell>
                  <TableCell>{case_.company}</TableCell>
                  <TableCell>{case_.pillar}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {case_.origin === 'Bot' ? (
                        <>
                          <Bot className="h-3 w-3" />
                          Bot
                        </>
                      ) : (
                        <>
                          <UserCog className="h-3 w-3" />
                          Especialista
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[case_.priority as keyof typeof priorityColors]}>
                      {case_.priority === 'high' && 'Alta'}
                      {case_.priority === 'medium' && 'Média'}
                      {case_.priority === 'low' && 'Baixa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {case_.requestDate}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCase(case_.id);
                        setIsDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Atribuir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Especialista</DialogTitle>
              <DialogDescription>
                Selecione o especialista mais adequado para este caso.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedCase && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Colaborador:</span>
                    <span className="font-medium">
                      {mockPendingCases.find(c => c.id === selectedCase)?.collaborator}
                    </span>
                    <span className="text-muted-foreground">Pilar:</span>
                    <span className="font-medium">
                      {mockPendingCases.find(c => c.id === selectedCase)?.pillar}
                    </span>
                    <span className="text-muted-foreground">Sintomas:</span>
                    <span className="font-medium">
                      {mockPendingCases.find(c => c.id === selectedCase)?.symptoms}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Especialista</label>
                <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSpecialists.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        {specialist.name} - {specialist.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAssign} disabled={!selectedSpecialist}>
                Confirmar Atribuição
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
