import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Filter,
  Users, 
  UserCheck,
  Shield,
  Clock,
  Eye,
  Power,
  PowerOff,
  ArrowUpRight,
  AlertTriangle,
  Brain,
  Heart,
  DollarSign,
  Scale,
  CheckCircle2,
  XCircle,
  Star
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mockProviders, AdminProvider as Provider } from '@/data/adminMockData';

const AdminProviders = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providers, searchQuery, pillarFilter, statusFilter]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setProviders(mockProviders);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar prestadores",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = providers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Pillar filter
    if (pillarFilter !== 'all') {
      filtered = filtered.filter(provider => 
        provider.pillar === pillarFilter
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.status === statusFilter);
    }

    setFilteredProviders(filtered);
  };

  const handleStatusChange = async (providerId: string, newStatus: 'Ativo' | 'Inativo') => {
    try {
      // Replace with actual API call
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: newStatus }
          : provider
      ));
      
      toast({
        title: newStatus === 'Ativo' ? "Prestador ativado" : "Prestador desativado",
        description: "Estado atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estado",
        variant: "destructive"
      });
    }
  };

  const handleExportProviders = () => {
    const headers = ['Nome', 'Email', 'Pilar', 'Especialidade', 'Tipo de Sessão', 'Estado', 'Satisfação'];
    const csv = [
      headers.join(','),
      ...filteredProviders.map(p => 
        [p.name, p.email, p.pillar, p.specialty, p.sessionType, p.status, p.satisfaction].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prestadores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: `${filteredProviders.length} prestadores exportados com sucesso`
    });
  };

  // Calculate summary metrics
  const totalProviders = providers.length;
  const activeProviders = providers.filter(p => p.status === 'Ativo').length;
  const avgSatisfaction = providers.length > 0 
    ? (providers.reduce((sum, p) => sum + p.satisfaction, 0) / providers.length).toFixed(1)
    : '0.0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'Ocupado':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Ocupado</Badge>;
      case 'Inativo':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'physical-wellness':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'financial-assistance':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'legal-assistance':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPillarName = (pillar: string) => {
    switch (pillar) {
      case 'mental-health':
        return 'SM';
      case 'physical-wellness':
        return 'BF';
      case 'financial-assistance':
        return 'AF';
      case 'legal-assistance':
        return 'AJ';
      default:
        return pillar;
    }
  };

  const formatPillar = (pillar: Provider['pillar']) => {
    return (
      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md w-fit">
        {getPillarIcon(pillar)}
        <span className="text-xs font-medium">{getPillarName(pillar)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Affiliates</h1>
            <p className="text-sm text-muted-foreground">Gerir affiliates e disponibilidade</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Procurar affiliates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pilares" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">Todos os Pilares</SelectItem>
                <SelectItem value="mental-health">Saúde Mental</SelectItem>
                <SelectItem value="physical-wellness">Bem-Estar Físico</SelectItem>
                <SelectItem value="financial-assistance">Assistência Financeira</SelectItem>
                <SelectItem value="legal-assistance">Assistência Jurídica</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Ocupado">Ocupado</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportProviders}>
              <Search className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button onClick={() => navigate('/admin/prestadores/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Affiliate
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Total de Affiliates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalProviders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+2</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                Affiliates Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeProviders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((activeProviders / totalProviders) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-600" />
                Satisfação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{avgSatisfaction}/10</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avaliação geral
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Total de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{providers.reduce((sum, p) => sum + p.totalSessions, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Realizadas até agora
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Providers Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-muted">
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo de Sessão</TableHead>
                  <TableHead>Satisfação</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchQuery || pillarFilter !== 'all' || statusFilter !== 'all'
                        ? 'Nenhum affiliate encontrado com os filtros aplicados' 
                        : 'Nenhum affiliate encontrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id} className="border-muted hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={provider.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">{provider.email}</p>
                            <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPillar(provider.pillar)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(provider.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {provider.sessionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                          <Star className="h-3 w-3 mr-1" />
                          {provider.satisfaction}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {provider.sessionsThisMonth} este mês
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/prestadores/${provider.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(
                              provider.id, 
                              provider.status === 'Ativo' ? 'Inativo' : 'Ativo'
                            )}
                          >
                            {provider.status === 'Ativo' ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProviders;