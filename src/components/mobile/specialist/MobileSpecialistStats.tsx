import { useEffect, useState } from 'react';
import { ArrowUp, Brain, DollarSign, Scale, Heart } from 'lucide-react';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Category {
  name: string;
  cases: number;
  icon: any;
  color: string;
}

interface Feedback {
  name: string;
  rating: string;
  note: string;
}

export function MobileSpecialistStats() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resolutionRate, setResolutionRate] = useState(68);
  const [referralRate, setReferralRate] = useState(32);
  const [chartData, setChartData] = useState([
    { month: 'Jan', value: 35 },
    { month: 'Fev', value: 42 },
    { month: 'Mar', value: 45 },
    { month: 'Abr', value: 50 }
  ]);
  
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Saúde Mental', cases: 0, icon: Brain, color: 'bg-blue-500' },
    { name: 'Assistência Financeira', cases: 0, icon: DollarSign, color: 'bg-green-500' },
    { name: 'Assistência Jurídica', cases: 0, icon: Scale, color: 'bg-purple-500' },
    { name: 'Bem-Estar Físico', cases: 0, icon: Heart, color: 'bg-yellow-500' }
  ]);

  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([
    { name: 'Ana Silva', rating: '4.5/5', note: 'Resolveu sua situação muito profissional e atenciosa.' },
    { name: 'Carlos Santos', rating: '5/5', note: 'Ajudou com horários, necessidade.' },
    { name: 'Maria Costa', rating: '4/5', note: 'Ótimo! Resolveu o meu problema rapidamente.' }
  ]);

  useEffect(() => {
    const loadStats = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setLoading(false);
          return;
        }

        // Fetch bookings for stats
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('pillar, status, rating')
          .eq('prestador_id', prestador.id)
          .gte('booking_date', new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]);

        if (error) throw error;

        // Calculate category counts
        const counts: Record<string, number> = {
          'saude_mental': 0,
          'assistencia_financeira': 0,
          'assistencia_juridica': 0,
          'bem_estar_fisico': 0
        };

        (bookings || []).forEach((booking: any) => {
          const pillar = booking.pillar || 'saude_mental';
          if (counts[pillar] !== undefined) {
            counts[pillar]++;
          }
        });

        setCategories([
          { name: 'Saúde Mental', cases: counts['saude_mental'], icon: Brain, color: 'bg-blue-500' },
          { name: 'Assistência Financeira', cases: counts['assistencia_financeira'], icon: DollarSign, color: 'bg-green-500' },
          { name: 'Assistência Jurídica', cases: counts['assistencia_juridica'], icon: Scale, color: 'bg-purple-500' },
          { name: 'Bem-Estar Físico', cases: counts['bem_estar_fisico'], icon: Heart, color: 'bg-yellow-500' }
        ]);

        // Calculate resolution rate
        const completed = (bookings || []).filter((b: any) => b.status === 'completed').length;
        const total = bookings?.length || 1;
        setResolutionRate(Math.round((completed / total) * 100));
        setReferralRate(100 - Math.round((completed / total) * 100));
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [profile?.id]);

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar estatísticas..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center text-gray-900 text-xl font-semibold mb-1">
            Estatísticas Pessoais
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Acompanhe o seu desempenho e métricas de atendimento
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-gray-900 font-semibold mb-1">Resolução Interna</h2>
              <p className="text-sm text-gray-600">Taxa de casos resolvidos</p>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+8%</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-bold text-gray-900">{resolutionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${resolutionRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-gray-900 font-semibold mb-1">Encaminhamentos</h2>
          <p className="text-sm text-gray-600 mb-4">Casos redirecionados</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-gray-900">{referralRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${referralRate}%` }}></div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Crescimento de séries em 4 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Categorias de Atendimento</h3>
          <div className="space-y-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{category.cases} casos</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Feedbacks Recentes</h3>
          <div className="space-y-3">
            {recentFeedback.map((item, index) => (
              <div key={index} className="p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <span className="text-sm text-yellow-600">★ {item.rating}</span>
                </div>
                <p className="text-xs text-gray-600 italic">"{item.note}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}
