import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Users,
  Star,
  Clock,
  Target,
  TrendingUp,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockCompanyCollaborators } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";

const CompanyCollaborators = () => {
  const [collaborators, setCollaborators] = useState(mockCompanyCollaborators);
  const [filteredCollaborators, setFilteredCollaborators] = useState(mockCompanyCollaborators);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null);
  const { toast } = useToast();

  // Filter collaborators
  React.useEffect(() => {
    let filtered = collaborators;

    if (searchQuery) {
      filtered = filtered.filter(collaborator =>
        collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.mostUsedPillar.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(collaborator => collaborator.status === statusFilter);
    }

    setFilteredCollaborators(filtered);
  }, [collaborators, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ativo
        </Badge>;
      case 'Inativo':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inativo
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'Bem-Estar Físico':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'Assistência Financeira':
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      case 'Assistência Jurídica':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarBadgeColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bem-Estar Físico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Assistência Financeira':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Assistência Jurídica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCollaborator = (collaborator: any) => {
    setSelectedCollaborator(collaborator);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso e bem-estar dos seus colaboradores
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Procurar por nome ou pilar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Estado:</label>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'Ativo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('Ativo')}
          >
            Ativos
          </Button>
          <Button
            variant={statusFilter === 'Inativo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('Inativo')}
          >
            Inativos
          </Button>
        </div>
      </div>

      {/* Collaborators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollaborators.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum colaborador encontrado com os filtros aplicados
          </div>
        ) : (
          filteredCollaborators.map((collaborator) => (
            <Card 
              key={collaborator.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
              onClick={() => handleViewCollaborator(collaborator)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{collaborator.name}</h3>
                    <p className="text-sm text-muted-foreground">Colaborador</p>
                  </div>
                  {getStatusBadge(collaborator.status)}
                </div>

                {/* Pilar */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pilar mais utilizado</p>
                  <Badge className={`${getPillarBadgeColor(collaborator.mostUsedPillar)} flex items-center gap-1 w-fit`}>
                    {getPillarIcon(collaborator.mostUsedPillar)}
                    {collaborator.mostUsedPillar}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessões realizadas:</span>
                    <span className="font-semibold">{collaborator.sessionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Último feedback:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {collaborator.lastFeedback}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progresso pessoal:</span>
                    <span className="font-semibold">{collaborator.personalProgress}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso geral</span>
                    <span className="font-medium">{collaborator.personalProgress}%</span>
                  </div>
                  <Progress 
                    value={collaborator.personalProgress} 
                    className="h-2"
                  />
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCollaborator(collaborator);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Collaborator Detail Modal */}
      <Dialog open={!!selectedCollaborator} onOpenChange={() => setSelectedCollaborator(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCollaborator?.name} - Detalhes Completos</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o colaborador
            </DialogDescription>
          </DialogHeader>
          
          {selectedCollaborator && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedCollaborator.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pilar Principal</label>
                  <div className="mt-1">
                    <Badge className={`${getPillarBadgeColor(selectedCollaborator.mostUsedPillar)} flex items-center gap-1 w-fit`}>
                      {getPillarIcon(selectedCollaborator.mostUsedPillar)}
                      {selectedCollaborator.mostUsedPillar}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sessões Realizadas</label>
                  <p className="text-2xl font-bold">{selectedCollaborator.sessionsCount}</p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progresso Pessoal
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Progresso geral dos objetivos</span>
                    <span className="font-semibold">{selectedCollaborator.personalProgress}%</span>
                  </div>
                  <Progress 
                    value={selectedCollaborator.personalProgress} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Baseado no progresso dos objetivos definidos no onboarding
                  </p>
                </div>
              </div>

              {/* Onboarding Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos Definidos no Onboarding
                </h3>
                <div className="grid gap-3">
                  {selectedCollaborator.onboardingGoals.map((goal: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Sessões
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Data</th>
                        <th className="p-3 text-left text-sm font-medium">Pilar</th>
                        <th className="p-3 text-left text-sm font-medium">Especialista</th>
                        <th className="p-3 text-right text-sm font-medium">Avaliação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCollaborator.sessionHistory.map((session: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-sm">
                            {new Date(session.date).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="p-3">
                            <Badge className={`${getPillarBadgeColor(session.pillar)} flex items-center gap-1 w-fit`}>
                              {getPillarIcon(session.pillar)}
                              {session.pillar}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">{session.specialist}</td>
                          <td className="p-3 text-sm text-right flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {session.rating}/10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedCollaborator.sessionsCount}</p>
                  <p className="text-sm text-muted-foreground">Total de Sessões</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-amber-600" />
                    {selectedCollaborator.lastFeedback}/10
                  </p>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyCollaborators;
