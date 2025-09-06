import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, TrendingUp, Award, Filter } from 'lucide-react';
import { Feedback, AdminPrestador } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackManagementPanelProps {
  feedback?: Feedback[];
  prestadores: AdminPrestador[];
}

const FeedbackManagementPanel = ({ feedback: propFeedback = [], prestadores = [] }: FeedbackManagementPanelProps) => {
  const [selectedPrestador, setSelectedPrestador] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback[]>(propFeedback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propFeedback.length === 0) {
      fetchFeedback();
    }
  }, [propFeedback]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          user_id,
          prestador_id,
          rating,
          comment,
          session_date,
          created_at,
          is_anonymous,
          profiles(name),
          prestadores(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFeedback: Feedback[] = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        userName: item.profiles?.name || 'Utilizador',
        prestadorId: item.prestador_id,
        prestadorName: item.prestadores?.name || 'Prestador',
        rating: item.rating,
        comment: item.comment || '',
        sessionDate: item.session_date,
        createdAt: item.created_at,
        isAnonymous: item.is_anonymous
      }));

      setFeedback(formattedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(fb => {
    const prestadorMatch = !selectedPrestador || fb.prestadorId === selectedPrestador;
    const ratingMatch = !selectedRating || fb.rating === selectedRating;
    return prestadorMatch && ratingMatch;
  });

  // Calculate prestador statistics
  const prestadorStats = prestadores.map(prestador => {
    const prestadorFeedback = feedback.filter(fb => fb.prestadorId === prestador.id);
    const averageRating = prestadorFeedback.length > 0 
      ? prestadorFeedback.reduce((sum, fb) => sum + fb.rating, 0) / prestadorFeedback.length 
      : 0;
    
    const ratingDistribution = {
      5: prestadorFeedback.filter(fb => fb.rating === 5).length,
      4: prestadorFeedback.filter(fb => fb.rating === 4).length,
      3: prestadorFeedback.filter(fb => fb.rating === 3).length,
      2: prestadorFeedback.filter(fb => fb.rating === 2).length,
      1: prestadorFeedback.filter(fb => fb.rating === 1).length,
    };

    return {
      ...prestador,
      feedbackCount: prestadorFeedback.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recentFeedback: prestadorFeedback.slice(-3)
    };
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50';
    if (rating >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const topRatedPrestadores = prestadorStats
    .filter(p => p.feedbackCount > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Sistema de Feedback e Avaliações
            <Badge variant="secondary">{feedback.length} avaliações</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="feedback">Feedback ({filteredFeedback.length})</TabsTrigger>
              <TabsTrigger value="prestadores">Prestadores</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Top Performers */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Prestadores Melhor Avaliados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topRatedPrestadores.map((prestador, index) => (
                    <Card key={prestador.id} className={`${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{prestador.name}</h4>
                          {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                        </div>
                        {renderStars(prestador.averageRating)}
                        <p className="text-sm text-gray-500 mt-1">
                          {prestador.feedbackCount} avaliações
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {prestador.specialty}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{feedback.length}</div>
                    <div className="text-sm text-gray-500">Total Avaliações</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {feedback.length > 0 ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-500">Avaliação Média</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {feedback.filter(fb => fb.rating === 5).length}
                    </div>
                    <div className="text-sm text-gray-500">5 Estrelas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {prestadorStats.filter(p => p.averageRating >= 4.5).length}
                    </div>
                    <div className="text-sm text-gray-500">Prestadores Excelentes</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <select
                    className="p-2 border rounded"
                    value={selectedPrestador}
                    onChange={(e) => setSelectedPrestador(e.target.value)}
                  >
                    <option value="">Todos os Prestadores</option>
                    {prestadores.map(prestador => (
                      <option key={prestador.id} value={prestador.id}>
                        {prestador.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="p-2 border rounded"
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(parseInt(e.target.value))}
                  >
                    <option value={0}>Todas as Avaliações</option>
                    <option value={5}>5 Estrelas</option>
                    <option value={4}>4 Estrelas</option>
                    <option value={3}>3 Estrelas</option>
                    <option value={2}>2 Estrelas</option>
                    <option value={1}>1 Estrela</option>
                  </select>
                </div>
              </div>

              {/* Feedback List */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>Prestador</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Comentário</TableHead>
                      <TableHead>Data Sessão</TableHead>
                      <TableHead>Data Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((fb) => (
                      <TableRow key={fb.id}>
                        <TableCell>
                          {fb.isAnonymous ? (
                            <Badge variant="secondary">Anónimo</Badge>
                          ) : (
                            fb.userName
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{fb.prestadorName}</TableCell>
                        <TableCell>{renderStars(fb.rating)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={fb.comment}>
                            {fb.comment}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(fb.sessionDate)}</TableCell>
                        <TableCell>{formatDate(fb.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="prestadores" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {prestadorStats.map((prestador) => (
                  <Card key={prestador.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{prestador.name}</CardTitle>
                          <p className="text-sm text-gray-500">{prestador.specialty}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(prestador.averageRating)}`}>
                          {prestador.averageRating.toFixed(1)} ⭐
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          {renderStars(prestador.averageRating)}
                          <p className="text-sm text-gray-500 mt-1">
                            {prestador.feedbackCount} avaliações
                          </p>
                        </div>

                        {/* Rating Distribution */}
                        <div>
                          <h4 className="font-medium mb-2">Distribuição de Avaliações</h4>
                          <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-6">{rating}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{
                                      width: `${prestador.feedbackCount > 0 
                                        ? (prestador.ratingDistribution[rating as keyof typeof prestador.ratingDistribution] / prestador.feedbackCount) * 100 
                                        : 0}%`
                                    }}
                                  />
                                </div>
                                <span className="text-sm w-8 text-right">
                                  {prestador.ratingDistribution[rating as keyof typeof prestador.ratingDistribution]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Feedback */}
                        {prestador.recentFeedback.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Feedback Recente</h4>
                            <div className="space-y-2">
                              {prestador.recentFeedback.map((fb) => (
                                <div key={fb.id} className="p-2 bg-gray-50 rounded text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    {renderStars(fb.rating)}
                                    <span className="text-gray-500">
                                      {fb.isAnonymous ? 'Anónimo' : fb.userName}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">{fb.comment}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Tendências de Satisfação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Muito Satisfeitos (5★)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${feedback.length > 0 ? (feedback.filter(fb => fb.rating === 5).length / feedback.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {feedback.length > 0 ? Math.round((feedback.filter(fb => fb.rating === 5).length / feedback.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Satisfeitos (4★)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${feedback.length > 0 ? (feedback.filter(fb => fb.rating === 4).length / feedback.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {feedback.length > 0 ? Math.round((feedback.filter(fb => fb.rating === 4).length / feedback.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Neutros (3★)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${feedback.length > 0 ? (feedback.filter(fb => fb.rating === 3).length / feedback.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {feedback.length > 0 ? Math.round((feedback.filter(fb => fb.rating === 3).length / feedback.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Insatisfeitos (1-2★)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${feedback.length > 0 ? (feedback.filter(fb => fb.rating <= 2).length / feedback.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {feedback.length > 0 ? Math.round((feedback.filter(fb => fb.rating <= 2).length / feedback.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Insights e Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {prestadorStats.filter(p => p.averageRating < 3.5 && p.feedbackCount > 2).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <h4 className="font-medium text-red-800 mb-1">⚠️ Atenção Necessária</h4>
                          <p className="text-sm text-red-700">
                            {prestadorStats.filter(p => p.averageRating < 3.5 && p.feedbackCount > 2).length} prestador(es) 
                            com avaliação baixa. Considere intervenção.
                          </p>
                        </div>
                      )}

                      {prestadorStats.filter(p => p.averageRating >= 4.5 && p.feedbackCount > 5).length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <h4 className="font-medium text-green-800 mb-1">✅ Excelente Performance</h4>
                          <p className="text-sm text-green-700">
                            {prestadorStats.filter(p => p.averageRating >= 4.5 && p.feedbackCount > 5).length} prestador(es) 
                            com excelente avaliação. Considere reconhecimento.
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-medium text-blue-800 mb-1">📊 Taxa de Resposta</h4>
                        <p className="text-sm text-blue-700">
                          Taxa de feedback: ~{Math.round((feedback.length / (prestadorStats.reduce((sum, p) => sum + p.totalBookings, 0) || 1)) * 100)}% 
                          das sessões geraram feedback.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagementPanel;