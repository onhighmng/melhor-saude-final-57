import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Video, Dumbbell, Brain, Heart, DollarSign, Scale } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Resource {
  id: string;
  title: string;
  pillar: string;
  type: 'article' | 'video' | 'exercise';
  image: string;
  description: string;
  views: number;
  rating: number;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Gestão de Stress no Trabalho',
    pillar: 'saude_mental',
    type: 'article',
    image: '/lovable-uploads/therapy-session.png',
    description: 'Técnicas práticas para gerir o stress diário',
    views: 245,
    rating: 4.5
  },
  {
    id: '2',
    title: 'Exercícios de Respiração',
    pillar: 'saude_mental',
    type: 'video',
    image: '/lovable-uploads/therapy-session.png',
    description: 'Vídeo guiado de exercícios de respiração',
    views: 189,
    rating: 4.8
  },
  {
    id: '3',
    title: 'Planeamento Financeiro Básico',
    pillar: 'assistencia_financeira',
    type: 'article',
    image: '/lovable-uploads/financial-planning.png',
    description: 'Guia completo para organizar as suas finanças',
    views: 156,
    rating: 4.3
  },
  {
    id: '4',
    title: 'Rotina de Exercícios em Casa',
    pillar: 'bem_estar_fisico',
    type: 'exercise',
    image: '/lovable-uploads/therapy-session.png',
    description: 'Exercícios que pode fazer em casa sem equipamento',
    views: 312,
    rating: 4.7
  }
];

const pillarIcons = {
  saude_mental: Brain,
  bem_estar_fisico: Heart,
  assistencia_financeira: DollarSign,
  assistencia_juridica: Scale
};

const pillarColors = {
  saude_mental: 'bg-blue-500/10 text-blue-700',
  bem_estar_fisico: 'bg-green-500/10 text-green-700',
  assistencia_financeira: 'bg-orange-500/10 text-orange-700',
  assistencia_juridica: 'bg-purple-500/10 text-purple-700'
};

const typeIcons = {
  article: FileText,
  video: Video,
  exercise: Dumbbell
};

export function AdminResourcesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = selectedPillar === "all" || resource.pillar === selectedPillar;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesPillar && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedPillar} onValueChange={setSelectedPillar}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Todos os Pilares" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pilares</SelectItem>
            <SelectItem value="saude_mental">Saúde Mental</SelectItem>
            <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
            <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
            <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Todos os Tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="article">Artigo</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="exercise">Exercício</SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Recurso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input placeholder="Nome do recurso" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pilar</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar pilar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                      <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
                      <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
                      <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Artigo</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="exercise">Exercício</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Breve descrição do conteúdo" rows={3} />
              </div>
              <div>
                <Label>URL da Imagem</Label>
                <Input placeholder="https://..." />
              </div>
              <Button className="w-full">Guardar Recurso</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const PillarIcon = pillarIcons[resource.pillar as keyof typeof pillarIcons];
          const TypeIcon = typeIcons[resource.type];
          const pillarColor = pillarColors[resource.pillar as keyof typeof pillarColors];

          return (
            <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                  src={resource.image} 
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={pillarColor}>
                    <PillarIcon className="h-3 w-3 mr-1" />
                    {resource.pillar.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                  <TypeIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {resource.views} visualizações
                  </span>
                  <span className="font-medium">
                    ⭐ {resource.rating.toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum recurso encontrado</p>
        </div>
      )}
    </div>
  );
}
