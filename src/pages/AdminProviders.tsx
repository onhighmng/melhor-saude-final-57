import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  XCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mockProviders, AdminProvider as Provider } from '@/data/adminMockData';

const AdminProviders = () => {
  const { t } = useTranslation(['admin', 'common', 'navigation']);
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providers, searchQuery, pillarFilter, statusFilter, licenseFilter]);

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
        title: t('common:error'),
        description: t('common:error'),
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
        provider.pillars.includes(pillarFilter as any)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.availability === statusFilter);
    }

    // License filter
    if (licenseFilter !== 'all') {
      filtered = filtered.filter(provider => provider.licenseStatus === licenseFilter);
    }

    setFilteredProviders(filtered);
  };

  const handleStatusChange = async (providerId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Replace with actual API call
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, availability: newStatus }
          : provider
      ));
      
      toast({
        title: newStatus === 'active' ? t('providers.providerActivated') : t('providers.providerDeactivated'),
        description: t('providers.statusUpdatedSuccess')
      });
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('providerDetail.statusUpdateError'),
        variant: "destructive"
      });
    }
  };

  const handleExportProviders = () => {
    const headers = t('providers.exportHeaders', { returnObjects: true }) as string[];
    const csv = [
      headers.join(','),
      ...filteredProviders.map(p => 
        [p.name, p.email, p.pillars.join(';'), p.availability, p.licenseStatus, p.capacity, p.defaultSlot].join(',')
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
      title: t('providers.exportComplete'),
      description: t('providers.exportedSuccess', { count: filteredProviders.length })
    });
  };

  // Calculate summary metrics
  const totalProviders = providers.length;
  const activeProviders = providers.filter(p => p.availability === 'active').length;
  const pendingLicenses = providers.filter(p => p.licenseStatus === 'pending').length;
  const avgWeeklyCapacity = providers.length > 0 
    ? Math.round(providers.reduce((sum, p) => sum + p.capacity, 0) / providers.length)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('common:active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">{t('common:inactive')}</Badge>;
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('providers.status.valid')}</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">{t('providers.status.expired')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">{t('providers.status.pending')}</Badge>;
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
        return t('providers.pillarNames.SM');
      case 'physical-wellness':
        return t('providers.pillarNames.BF');
      case 'financial-assistance':
        return t('providers.pillarNames.AF');
      case 'legal-assistance':
        return t('providers.pillarNames.AJ');
      default:
        return pillar;
    }
  };

  const formatPillars = (pillars: Provider['pillars']) => {
    return (
      <div className="flex flex-wrap gap-1">
        {pillars.map(pillar => (
          <div key={pillar} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
            {getPillarIcon(pillar)}
            <span className="text-xs font-medium">{getPillarName(pillar)}</span>
          </div>
        ))}
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
            <h1 className="text-2xl font-bold text-foreground">{t('providers.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('providers.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('providers.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('providers.pillars')} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">{t('providers.pillars')}</SelectItem>
                <SelectItem value="mental-health">{t('navigation:pillars.mentalHealth', 'Saúde Mental')}</SelectItem>
                <SelectItem value="physical-wellness">{t('navigation:pillars.physicalWellness', 'Bem-Estar Físico')}</SelectItem>
                <SelectItem value="financial-assistance">{t('navigation:pillars.financialAssistance', 'Assistência Financeira')}</SelectItem>
                <SelectItem value="legal-assistance">{t('navigation:pillars.legalAssistance', 'Assistência Jurídica')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('common.status')} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">{t('providers.states')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('providers.licenses')} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">{t('providers.licenses')}</SelectItem>
                <SelectItem value="valid">{t('providers.status.valid')}</SelectItem>
                <SelectItem value="pending">{t('providers.status.pending')}</SelectItem>
                <SelectItem value="expired">{t('providers.status.expired')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportProviders}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.export')}
            </Button>
            
            <Button onClick={() => navigate('/admin/prestadores/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('providers.addProvider')}
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
                {t('providers.metrics.totalProviders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalProviders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+2</span> {t('providers.metrics.thisMonth')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                {t('providers.metrics.activeProviders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeProviders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((activeProviders / totalProviders) * 100)}% {t('providers.metrics.ofTotal')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-600" />
                {t('providers.metrics.pendingLicenses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingLicenses}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                {t('providers.metrics.requiresVerification')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                {t('providers.metrics.avgWeeklyCapacity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{avgWeeklyCapacity}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('providers.metrics.sessionsPerProvider')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Providers Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">{t('providers.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-muted">
                  <TableHead>{t('providers.table.provider')}</TableHead>
                  <TableHead>{t('providers.table.servedPillars')}</TableHead>
                  <TableHead>{t('providers.table.availability')}</TableHead>
                  <TableHead>{t('providers.table.license')}</TableHead>
                  <TableHead>{t('providers.table.capacity')}</TableHead>
                  <TableHead>{t('providers.table.defaultSlot')}</TableHead>
                  <TableHead>{t('providers.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchQuery || pillarFilter !== 'all' || statusFilter !== 'all' || licenseFilter !== 'all'
                        ? t('providers.noProvidersWithFilters') 
                        : t('providers.noProvidersFound')}
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
                            {provider.languages && (
                              <div className="flex gap-1 mt-1">
                                {provider.languages.map(lang => (
                                  <Badge key={lang} variant="outline" className="text-xs px-1 py-0">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPillars(provider.pillars)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(provider.availability)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(provider.licenseStatus)}
                           {provider.licenseExpiry && provider.licenseStatus === 'valid' && (
                             <p className="text-xs text-muted-foreground">
                               {t('providers.table.expiresOn')} {new Date(provider.licenseExpiry).toLocaleDateString('pt-PT')}
                             </p>
                           )}
                           {provider.licenseStatus === 'expired' && provider.licenseExpiry && (
                             <p className="text-xs text-red-600">
                               {t('providers.table.expiredOn')} {new Date(provider.licenseExpiry).toLocaleDateString('pt-PT')}
                             </p>
                           )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {provider.capacity} sessões/semana
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {provider.defaultSlot} min
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
                              provider.availability === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {provider.availability === 'active' ? (
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