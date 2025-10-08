import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  PowerOff,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Heart,
  DollarSign,
  Scale,
  User,
  Settings,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserById, generateMockUserDetail } from '@/data/adminMockData';
import { formatDate } from '@/utils/dateFormatting';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  company: string;
  department?: string;
  companySessions: number;
  personalSessions: number;
  usedCompanySessions: number;
  usedPersonalSessions: number;
  status: 'active' | 'inactive';
  createdAt: string;
  fixedProviders: {
    mentalHealth?: { name: string; id: string; };
    physicalWellness?: { name: string; id: string; };
    financialAssistance?: { name: string; id: string; };
    legalAssistance?: { name: string; id: string; };
  };
  changeRequests: Array<{
    id: string;
    pillar: string;
    currentProvider: string;
    requestedProvider: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
  sessionHistory: Array<{
    id: string;
    date: string;
    pillar: string;
    provider: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    type: 'company' | 'personal';
  }>;
  sessionUsageData: Array<{
    month: string;
    company: number;
    personal: number;
  }>;
}

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        const baseUser = getUserById(id || '1');
        
        if (baseUser) {
          const userDetail = generateMockUserDetail(baseUser);
          setUser(userDetail as UserDetail);
        }
        
        setIsLoading(false);
      }, 800);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('userDetail.loadError'),
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!user) return;
    
    try {
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: newStatus === 'active' ? t('userDetail.userActivated') : t('userDetail.userSuspended'),
        description: t('userDetail.statusUpdated')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('userDetail.statusUpdateError'),
        variant: "destructive"
      });
    }
  };

  const handleChangeRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    
    try {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          changeRequests: prev.changeRequests.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' as const }
              : req
          )
        };
      });
      
      toast({
        title: action === 'approve' ? t('userDetail.requests.approved') : t('userDetail.requests.rejected'),
        description: t('userDetail.requests.actionProcessed')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('userDetail.requests.errorProcessing'),
        variant: "destructive"
      });
    }
  };

  const handleEditProfile = () => {
    toast({
      title: t('userDetail.editProfile'),
      description: t('userDetail.editProfileComingSoon')
    });
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant={
      status === 'active' || status === 'approved' || status === 'completed' ? 'default' :
      status === 'inactive' || status === 'cancelled' ? 'secondary' :
      status === 'rejected' ? 'destructive' : 'outline'
    } className={
      status === 'active' || status === 'approved' || status === 'completed' ? 'bg-green-100 text-green-800' :
      status === 'pending' ? 'text-amber-600 border-amber-300' : ''
    }>
      {t(`common.status.${status}`)}
    </Badge>;
  };

  const pillarIcons = {
    'Saúde Mental': Brain,
    'Bem-Estar Físico': Heart,
    'Assistência Financeira': DollarSign,
    'Assistência Jurídica': Scale
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('userDetail.back')}
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t('userDetail.userNotFound')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('userDetail.back')}
            </Button>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="outline">{user.company}</Badge>
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEditProfile}>
              <Edit className="h-4 w-4 mr-2" />
              {t('userDetail.editProfile')}
            </Button>
            <Button
              variant={user.status === 'active' ? 'destructive' : 'default'}
              onClick={() => handleStatusChange(user.status === 'active' ? 'inactive' : 'active')}
            >
              {user.status === 'active' ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  {t('userDetail.suspend')}
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  {t('userDetail.activate')}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t('userDetail.tabs.profile')}</TabsTrigger>
            <TabsTrigger value="sessions">{t('userDetail.tabs.sessions')}</TabsTrigger>
            <TabsTrigger value="providers">{t('userDetail.tabs.providers')}</TabsTrigger>
            <TabsTrigger value="requests">{t('userDetail.tabs.requests')}</TabsTrigger>
            <TabsTrigger value="history">{t('userDetail.tabs.history')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('userDetail.profile.basicData')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('userDetail.profile.fullName')}</Label>
                    <Input value={user.name} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('userDetail.profile.email')}</Label>
                    <Input value={user.email} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('userDetail.profile.company')}</Label>
                    <Input value={user.company} readOnly className="mt-1" />
                  </div>
                  {user.department && (
                    <div>
                      <Label>{t('userDetail.profile.department')}</Label>
                      <Input value={user.department} readOnly className="mt-1" />
                    </div>
                  )}
                  <div>
                    <Label>{t('userDetail.profile.createdAt')}</Label>
                    <Input value={formatDate(user.createdAt)} readOnly className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('userDetail.profile.administrativeActions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('userDetail.profile.adjustCompanySessions')}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          value={user.companySessions} 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>{t('userDetail.profile.adjustPersonalSessions')}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          value={user.personalSessions} 
                          className="flex-1"
                        />
                        <Button size="sm">
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      {t('userDetail.profile.impersonateUser')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t('userDetail.sessions.companySessions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.used')}</span>
                        <span className="font-medium">{user.usedCompanySessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.available')}</span>
                        <span className="font-medium">{user.companySessions - user.usedCompanySessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.total')}</span>
                        <span className="font-medium">{user.companySessions}</span>
                      </div>
                      <Progress 
                        value={(user.usedCompanySessions / user.companySessions) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('userDetail.sessions.personalSessions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.used')}</span>
                        <span className="font-medium">{user.usedPersonalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.available')}</span>
                        <span className="font-medium">{user.personalSessions - user.usedPersonalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('userDetail.sessions.total')}</span>
                        <span className="font-medium">{user.personalSessions}</span>
                      </div>
                      <Progress 
                        value={(user.usedPersonalSessions / user.personalSessions) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('userDetail.sessions.usageTimeline')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={user.sessionUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="company" fill="hsl(var(--primary))" name={t('userDetail.sessions.companyLabel')} />
                      <Bar dataKey="personal" fill="hsl(var(--secondary))" name={t('userDetail.sessions.personalLabel')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries({
                'Saúde Mental': user.fixedProviders.mentalHealth,
                'Bem-Estar Físico': user.fixedProviders.physicalWellness,
                'Assistência Financeira': user.fixedProviders.financialAssistance,
                'Assistência Jurídica': user.fixedProviders.legalAssistance
              }).map(([pillar, provider]) => {
                const Icon = pillarIcons[pillar as keyof typeof pillarIcons];
                const hasChangeRequest = user.changeRequests.some(req => 
                  req.pillar === pillar && req.status === 'pending'
                );
                
                return (
                  <Card key={pillar}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {pillar}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-muted-foreground">{t('userDetail.requests.currentProvider')}</Label>
                          <p className="font-medium">{provider?.name || t('userDetail.providers.noneAssigned')}</p>
                        </div>
                        {hasChangeRequest && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {t('userDetail.providers.changeRequestPending')}
                            </Badge>
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="w-full">
                          {t('userDetail.providers.assignProvider')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('userDetail.requests.changeRequests')}</CardTitle>
              </CardHeader>
              <CardContent>
                {user.changeRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t('userDetail.requests.noRequests')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {user.changeRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{request.pillar}</h4>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('userDetail.requests.currentProvider')}: <span className="font-medium">{request.currentProvider}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t('userDetail.requests.requestedProvider')}: <span className="font-medium">{request.requestedProvider}</span>
                            </p>
                            <p className="text-sm">
                              <strong>{t('userDetail.requests.reason')}:</strong> {request.reason}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('userDetail.requests.createdAt')} {formatDate(request.createdAt)}
                            </p>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleChangeRequestAction(request.id, 'approve')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                {t('userDetail.requests.approve')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleChangeRequestAction(request.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {t('userDetail.requests.reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('userDetail.history.sessionHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('userDetail.history.date')}</TableHead>
                      <TableHead>{t('userDetail.history.pillar')}</TableHead>
                      <TableHead>{t('userDetail.history.provider')}</TableHead>
                      <TableHead>{t('userDetail.history.type')}</TableHead>
                      <TableHead>{t('userDetail.history.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.sessionHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {t('userDetail.history.noHistory')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      user.sessionHistory.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {formatDate(session.date)}
                          </TableCell>
                          <TableCell>{session.pillar}</TableCell>
                          <TableCell>{session.provider}</TableCell>
                          <TableCell>
                            <Badge variant={session.type === 'company' ? 'default' : 'secondary'}>
                              {session.type === 'company' ? t('userDetail.history.company') : t('userDetail.history.personal')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUserDetail;
