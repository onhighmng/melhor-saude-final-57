import { useState, useEffect } from 'react';
import { BookOpen, Plus, FileText, Video, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  url?: string;
}

export function MobileAdminResources() {
  const [selectedType, setSelectedType] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedResources: Resource[] = (data || []).map((resource: any) => ({
        id: resource.id,
        title: resource.title || 'Recurso',
        type: resource.resource_type || 'pdf',
        category: resource.category || 'Geral',
        url: resource.url || resource.file_url
      }));

      setResources(mappedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = selectedType === 'all' 
    ? resources 
    : resources.filter(r => r.type.toLowerCase() === selectedType.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Recursos</h1>
              <p className="text-gray-500 text-sm">Gerir recursos da plataforma</p>
            </div>
            <Button size="icon" className="bg-blue-600">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Type Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pdf', 'video', 'article'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {type === 'all' ? 'Todos' : type.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingAnimation variant="inline" message="A carregar recursos..." showProgress={true} />
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum recurso disponível</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
            <Card 
              key={resource.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {resource.type === 'video' ? (
                    <Video className="w-6 h-6 text-blue-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="flex-shrink-0"
                  onClick={() => resource.url && window.open(resource.url, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav userType="admin" />
    </div>
  );
}

