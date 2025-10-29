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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  PowerOff,
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
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatDate } from '@/utils/dateFormatting';

interface ProviderDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  pillars: ('mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance')[];
  availability: 'active' | 'inactive';
  licenseStatus: 'valid' | 'expired' | 'pending';
  licenseNumber?: string;
  licenseExpiry?: string;
  capacity: number;
  defaultSlot: number;
  languages: string[];
  location?: string;
  website?: string;
  specialties: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience: number;
  rating: number;
  totalSessions: number;
  completedSessions: number;
  upcomingBookings: Array<{
    id: string;
    date: string;
    time: string;
    patient: string;
    pillar: string;
    status: 'scheduled' | 'confirmed';
  }>;
  sessionHistory: Array<{
    id: string;
    date: string;
    patient: string;
    pillar: string;
    duration: number;
    status: 'completed' | 'cancelled' | 'no-show';
  }>;
  monthlyStats: Array<{
    month: string;
    sessions: number;
    revenue: number;
  }>;
}

const AdminProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      // Load prestador without joins
      const { data: prestador, error: prestadorError } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', id)
        .single();

      if (prestadorError) throw prestadorError;

      // Get sessions for this provider
      const { data: sessions, error: sessionsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('prestador_id', id);

      if (sessionsError) throw sessionsError;

      const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
      const ratings = completedSessions.map(s => s.rating).filter(r => r !== null) as number[];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      setProvider({
        id: prestador.id,
        name: prestador.name || '',
        email: prestador.email || '',
        phone: '',
        avatar: prestador.photo_url,
        bio: prestador.biography,
        pillars: (prestador.pillar_specialties || []) as any,
        availability: prestador.is_active ? 'active' : 'inactive',
        licenseStatus: 'valid' as const,
        capacity: 20,
        defaultSlot: 60,
        languages: prestador.languages || [],
        specialties: (prestador as any).specialization || [],
        education: [],
        experience: (prestador as any).experience_years || 0,
        rating: avgRating,
        totalSessions: sessions?.length || 0,
        completedSessions: completedSessions.length,
        upcomingBookings: sessions?.filter(s => s.status === 'confirmed').slice(0, 5).map(s => ({
          id: s.id,
          date: s.date,
          time: s.start_time || '',
          patient: '',
          pillar: s.pillar,
          status: 'scheduled' as const
        })) || [],
        sessionHistory: sessions?.slice(0, 10).map(s => ({
          id: s.id,
          date: s.date,
          patient: '',
          pillar: s.pillar,
          duration: 60,
          status: s.status as any
        })) || [],
        monthlyStats: []
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar detalhes do prestador';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!provider || !id) return;
    
    try {
      const { error } = await supabase
        .from('prestadores')
        .update({ is_active: newStatus === 'active' })
        .eq('id', id);

      if (error) throw error;

      setProvider(prev => prev ? { ...prev, availability: newStatus } : null);
      
      toast({
        title: newStatus === 'active' ? t('providerDetail.providerActivated') : t('providerDetail.providerDeactivated'),
        description: t('providerDetail.statusUpdated')
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status do prestador';
      toast({
        title: t('common:error'),
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    toast({
      title: t('providerDetail.editProvider'),
      description: t('providerDetail.editProviderComingSoon')
    });
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof t;
    return <Badge variant={
      status === 'active' || status === 'valid' || status === 'confirmed' || status === 'completed' ? 'default' :
      status === 'inactive' || status === 'cancelled' ? 'secondary' :
      status === 'expired' || status === 'no-show' ? 'destructive' : 'outline'
    } className={
      status === 'active' || status === 'valid' || status === 'confirmed' || status === 'completed' ? 'bg-green-100 text-green-800' :
      status === 'inactive' || status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
      status === 'expired' || status === 'no-show' ? 'bg-red-100 text-red-800' :
      status === 'pending' ? 'text-amber-600 border-amber-300 bg-amber-50' :
      status === 'scheduled' ? 'text-blue-600 border-blue-300 bg-blue-50' : ''
    }>
      {t(`common.status.${status}`)}
    </Badge>;
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
    const pillarMap: { [key: string]: string } = {
      'mental-health': 'mentalHealth',
      'physical-wellness': 'physicalWellness',
      'financial-assistance': 'financialAssistance',
      'legal-assistance': 'legalAssistance'
    };
    return t(`common.pillars.${pillarMap[pillar] || pillar}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-96 bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/prestadores')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('providerDetail.backToProviders')}
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">{t('providerDetail.providerNotFound')}</h2>
              <p className="text-muted-foreground">{t('providerDetail.providerNotFoundDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completionRate = provider.totalSessions > 0 ? (provider.completedSessions / provider.totalSessions) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/prestadores')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('providerDetail.backToProviders')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
              <p className="text-sm text-muted-foreground">{t('providerDetail.providerDetails')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              {t('providerDetail.edit')}
            </Button>
            <Button
              variant={provider.availability === 'active' ? "destructive" : "default"}
              onClick={() => handleStatusChange(provider.availability === 'active' ? 'inactive' : 'active')}
            >
              {provider.availability === 'active' ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  {t('providerDetail.deactivate')}
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  {t('providerDetail.activate')}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Provider Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{provider.name}</h2>
                  <p className="text-lg text-muted-foreground">{provider.email}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {getStatusBadge(provider.availability)}
                  {getStatusBadge(provider.licenseStatus)}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{provider.rating}</span>
                  </div>
                  <Badge variant="outline">{provider.experience} {t('providerDetail.yearsExperience')}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {provider.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                  )}
                  {provider.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.location}</span>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {t('providerDetail.website')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t('providerDetail.tabs.profile')}</TabsTrigger>
            <TabsTrigger value="sessions">{t('providerDetail.tabs.sessions')}</TabsTrigger>
            <TabsTrigger value="schedule">{t('providerDetail.tabs.schedule')}</TabsTrigger>
            <TabsTrigger value="history">{t('providerDetail.tabs.history')}</TabsTrigger>
            <TabsTrigger value="stats">{t('providerDetail.tabs.stats')}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('providerDetail.profile.personalInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('providerDetail.profile.email')}</Label>
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  </div>
                  {provider.phone && (
                    <div>
                      <Label>{t('providerDetail.profile.phone')}</Label>
                      <p className="text-sm text-muted-foreground">{provider.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label>{t('providerDetail.profile.languages')}</Label>
                    <div className="flex gap-1 mt-1">
                      {provider.languages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>{t('providerDetail.profile.biography')}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{provider.bio}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('providerDetail.profile.qualifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('providerDetail.profile.licenseNumber')}</Label>
                    <p className="text-sm text-muted-foreground">{provider.licenseNumber}</p>
                  </div>
                  {provider.licenseExpiry && (
                    <div>
                      <Label>{t('providerDetail.profile.licenseExpiry')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(provider.licenseExpiry)}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>{t('providerDetail.profile.specialties')}</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.specialties.map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('providerDetail.profile.education')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provider.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pillars */}
            <Card>
              <CardHeader>
                <CardTitle>{t('providers.table.servedPillars')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.pillars.map(pillar => (
                    <div key={pillar} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getPillarIcon(pillar)}
                      <span className="font-medium">{getPillarName(pillar)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('providerDetail.stats.totalSessions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{provider.totalSessions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('providerDetail.stats.completedSessions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{provider.completedSessions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('providerDetail.stats.completionRate')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('providerDetail.sessions.sessionHistory')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('providers.table.capacity')}</Label>
                  <p className="text-sm text-muted-foreground">{provider.capacity} {t('providerDetail.sessions.sessionHistory')}</p>
                </div>
                <div>
                  <Label>{t('providers.table.defaultSlot')}</Label>
                  <p className="text-sm text-muted-foreground">{provider.defaultSlot} {t('providerDetail.sessions.minutes')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t('providerDetail.sessions.upcomingBookings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('providerDetail.sessions.date')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.time')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.patient')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.pillar')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.upcomingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.date)}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell>{booking.patient}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPillarIcon(booking.pillar)}
                            <span>{getPillarName(booking.pillar)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('providerDetail.sessions.sessionHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('providerDetail.sessions.date')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.patient')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.pillar')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.duration')}</TableHead>
                      <TableHead>{t('providerDetail.sessions.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {provider.sessionHistory.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{formatDate(session.date)}</TableCell>
                        <TableCell>{session.patient}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPillarIcon(session.pillar)}
                            <span>{getPillarName(session.pillar)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{session.duration} min</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('providerDetail.stats.monthlyPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={provider.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#3b82f6" name={t('providerDetail.stats.sessions')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProviderDetail;
