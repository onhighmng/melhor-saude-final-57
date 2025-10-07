import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar,
  Clock,
  Eye,
  Power,
  PowerOff,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { mockUsers, AdminUser as User } from '@/data/adminMockData';

const AdminUsers = () => {
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const companies = Array.from(new Set(mockUsers.map(user => user.company))).sort();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, statusFilter, companyFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.error'),
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter(user => user.company === companyFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Replace with actual API call
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      
      toast({
        title: newStatus === 'active' ? t('users.userActivated') : t('users.userSuspended'),
        description: t('users.statusUpdatedSuccess')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('users.statusUpdateError'),
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = () => {
    toast({
      title: t('users.createUser'),
      description: t('users.createUserComingSoon')
    });
  };

  const handleExportUsers = () => {
    const headers = t('users.exportHeaders', { returnObjects: true }) as string[];
    const csv = [
      headers.join(','),
      ...filteredUsers.map(user => 
        [user.name, user.email, user.company, user.department || '', user.companySessions, user.personalSessions, user.status, user.createdAt].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilizadores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t('users.exportComplete'),
      description: t('users.exportedSuccess', { count: filteredUsers.length })
    });
  };


  // Calculate summary metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalSessionsMTD = users.reduce((sum, u) => sum + u.usedCompanySessions + u.usedPersonalSessions, 0);
  const pendingChangeRequests = 3; // Mock value

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('common.active')}</Badge>;
      case 'inactive':
        return <Badge variant="destructive">{t('common.inactive')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatProviders = (providers: User['fixedProviders']) => {
    const providerList = Object.entries(providers)
      .filter(([_, name]) => name)
      .map(([pillar, name]) => {
        const pillarNames = {
          mentalHealth: 'SM',
          physicalWellness: 'BF',
          financialAssistance: 'AF',
          legalAssistance: 'AJ'
        };
        return `${pillarNames[pillar as keyof typeof pillarNames]}: ${name}`;
      });
    
    return providerList.length > 0 ? providerList.join(', ') : t('users.table.none');
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
            <h1 className="text-2xl font-bold text-foreground">{t('users.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('common.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.status')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('common.company')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.company')}</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportUsers}>
              <Search className="h-4 w-4 mr-2" />
              {t('common.export')}
            </Button>
            
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              {t('users.createUser')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('users.metrics.totalUsers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+5</span> {t('users.metrics.thisMonth')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                {t('users.metrics.activeUsers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((activeUsers / totalUsers) * 100)}% {t('users.metrics.ofTotal')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('users.metrics.sessionsMTD')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSessionsMTD}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="h-3 w-3 inline text-green-600" />
                <span className="text-green-600">+18%</span> {t('users.metrics.vsPreviousMonth')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('users.metrics.pendingRequests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingChangeRequests}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1 text-amber-600" />
                {t('users.metrics.requiresAttention')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{t('users.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.table.user')}</TableHead>
                  <TableHead>{t('users.table.company')}</TableHead>
                  <TableHead>{t('users.table.department')}</TableHead>
                  <TableHead>{t('users.table.availableSessions')}</TableHead>
                  <TableHead>{t('users.table.fixedProviders')}</TableHead>
                  <TableHead>{t('users.table.status')}</TableHead>
                  <TableHead>{t('users.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' || companyFilter !== 'all' 
                        ? t('users.noUsersWithFilters') 
                        : t('users.noUsersFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell>
                         <p className="font-medium">{user.company}</p>
                       </TableCell>
                       <TableCell>
                         <p className="text-sm text-muted-foreground">{user.department || '—'}</p>
                       </TableCell>
                       <TableCell>
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">{t('users.table.companyLabel')}</span>
                             <Badge variant="outline" className="text-xs">
                               {user.companySessions - user.usedCompanySessions}/{user.companySessions}
                             </Badge>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">{t('users.table.personalLabel')}</span>
                             <Badge variant="outline" className="text-xs">
                               {user.personalSessions - user.usedPersonalSessions}/{user.personalSessions}
                             </Badge>
                           </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate text-sm text-muted-foreground">
                          {formatProviders(user.fixedProviders)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/usuarios/${user.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(
                              user.id, 
                              user.status === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {user.status === 'active' ? (
                              <Power className="h-4 w-4 text-green-500" />
                            ) : (
                              <PowerOff className="h-4 w-4 text-red-500" />
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

export default AdminUsers;