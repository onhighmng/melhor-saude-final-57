import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PsychologicalTest } from '@/types/selfHelp';
import { Clock, FileText, Play } from 'lucide-react';

interface PsychologicalTestCardProps {
  test: PsychologicalTest;
  onStartTest: () => void;
}

const PsychologicalTestCard: React.FC<PsychologicalTestCardProps> = ({ test, onStartTest }) => {
  const getEstimatedTime = () => {
    const questionCount = test.questions.length;
    const estimatedMinutes = Math.ceil(questionCount * 0.5); // 30 seconds per question
    return estimatedMinutes;
  };

  const getTestTypeLabel = () => {
    switch (test.test_type) {
      case 'PHQ-9':
        return 'Depressão';
      case 'GAD-7':
        return 'Ansiedade';
      default:
        return test.test_type;
    }
  };

  const getTestTypeColor = () => {
    switch (test.test_type) {
      case 'PHQ-9':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'GAD-7':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge variant="secondary" className={getTestTypeColor()}>
            {getTestTypeLabel()}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>~{getEstimatedTime()} min</span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold leading-tight">
          {test.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {test.description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>{test.questions.length} perguntas</span>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Nota:</strong> Este questionário é apenas uma ferramenta de rastreio. 
            Para um diagnóstico adequado, consulte sempre um profissional de saúde mental.
          </p>
        </div>
        
        <Button 
          onClick={onStartTest}
          className="w-full flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Iniciar Teste
        </Button>
      </CardContent>
    </Card>
  );
};

export default PsychologicalTestCard;