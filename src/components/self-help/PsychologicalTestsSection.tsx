import React, { useState } from 'react';
import { usePsychologicalTests } from '@/hooks/useSelfHelp';
import PsychologicalTestCard from './PsychologicalTestCard';
import PsychologicalTestModal from './PsychologicalTestModal';
import { PsychologicalTest } from '@/types/selfHelp';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertTriangle } from 'lucide-react';

const PsychologicalTestsSection: React.FC = () => {
  const { tests, loading, error } = usePsychologicalTests();
  const [selectedTest, setSelectedTest] = useState<PsychologicalTest | null>(null);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar testes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Testes Psicológicos</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas de autoavaliação validadas para ajudá-lo a compreender melhor a sua saúde mental
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Aviso Importante
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                Estes questionários são apenas ferramentas de rastreio e não substituem uma avaliação profissional. 
                Se estiver a passar por dificuldades emocionais ou psicológicas, recomendamos que consulte um 
                profissional de saúde mental qualificado.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <PsychologicalTestCard
                key={test.id}
                test={test}
                onStartTest={() => setSelectedTest(test)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Nenhum teste disponível</h3>
              <p className="text-muted-foreground">
                Não há testes psicológicos disponíveis no momento.
              </p>
            </div>
          </div>
        )}

        {selectedTest && (
          <PsychologicalTestModal
            test={selectedTest}
            isOpen={!!selectedTest}
            onClose={() => setSelectedTest(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PsychologicalTestsSection;