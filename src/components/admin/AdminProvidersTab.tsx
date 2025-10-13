import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Brain,
  Dumbbell,
  DollarSign,
  Scale,
  Star,
  Euro,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  pillars: string[];
  costPerSession: number;
  avgSatisfaction: number;
  totalSessions: number;
  availability: 'Disponível' | 'Ocupado';
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dra. Maria Santos',
    specialty: 'Psicologia Clínica',
    pillars: ['Saúde Mental'],
    costPerSession: 45,
    avgSatisfaction: 9.2,
    totalSessions: 234,
    availability: 'Disponível'
  },
  {
    id: '2',
    name: 'Prof. Ana Rodrigues',
    specialty: 'Personal Training',
    pillars: ['Bem-Estar Físico'],
    costPerSession: 35,
    avgSatisfaction: 8.8,
    totalSessions: 189,
    availability: 'Disponível'
  },
  {
    id: '3',
    name: 'Dr. Paulo Reis',
    specialty: 'Consultoria Financeira',
    pillars: ['Assistência Financeira'],
    costPerSession: 50,
    avgSatisfaction: 9.0,
    totalSessions: 156,
    availability: 'Ocupado'
  },
  {
    id: '4',
    name: 'Dra. Sofia Alves',
    specialty: 'Direito do Trabalho',
    pillars: ['Assistência Jurídica'],
    costPerSession: 60,
    avgSatisfaction: 8.5,
    totalSessions: 98,
    availability: 'Disponível'
  },
  {
    id: '5',
    name: 'Dr. Fernando Alves',
    specialty: 'Planeamento Financeiro',
    pillars: ['Assistência Financeira'],
    costPerSession: 48,
    avgSatisfaction: 9.1,
    totalSessions: 142,
    availability: 'Disponível'
  },
  {
    id: '6',
    name: 'Dra. Beatriz Silva',
    specialty: 'Psiquiatria',
    pillars: ['Saúde Mental'],
    costPerSession: 70,
    avgSatisfaction: 9.5,
    totalSessions: 187,
    availability: 'Ocupado'
  },
];

const pillarIcons: Record<string, any> = {
  'Saúde Mental': Brain,
  'Bem-Estar Físico': Dumbbell,
  'Assistência Financeira': DollarSign,
  'Assistência Jurídica': Scale,
};

const pillarColors: Record<string, string> = {
  'Saúde Mental': 'bg-mint-green/10 text-mint-green border-mint-green/20',
  'Bem-Estar Físico': 'bg-royal-blue/10 text-royal-blue border-royal-blue/20',
  'Assistência Financeira': 'bg-peach-orange/10 text-peach-orange border-peach-orange/20',
  'Assistência Jurídica': 'bg-sky-blue/10 text-sky-blue border-sky-blue/20',
};

export const AdminProvidersTab = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = mockProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.pillars.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar prestadores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-vibrant-blue to-mint-green text-white">
                      {provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                  </div>
                </div>
                <Badge 
                  variant={provider.availability === 'Disponível' ? 'default' : 'secondary'}
                  className={`${
                    provider.availability === 'Disponível' 
                      ? 'bg-success text-white' 
                      : 'bg-muted'
                  } flex items-center gap-1`}
                >
                  {provider.availability === 'Disponível' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {provider.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pilar</p>
                <div className="flex flex-wrap gap-2">
                  {provider.pillars.map((pillar) => {
                    const Icon = pillarIcons[pillar];
                    return (
                      <Badge 
                        key={pillar} 
                        variant="outline" 
                        className={pillarColors[pillar]}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {pillar}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Custo/Sessão</p>
                  <p className="font-bold text-sm">{provider.costPerSession}€</p>
                </div>

                <div className="text-center border-x">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-peach-orange fill-peach-orange" />
                  </div>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                  <p className="font-bold text-sm">{provider.avgSatisfaction}/10</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Sessões</p>
                  <p className="font-bold text-sm">{provider.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
