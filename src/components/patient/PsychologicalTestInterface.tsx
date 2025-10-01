import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PsychologicalTest {
  id: string;
  test_name: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    options: Array<{
      value: number;
      text: string;
    }>;
  }>;
  scoring_method: {
    total_points: number;
    interpretation: Array<{
      min: number;
      max: number;
      category: string;
      description: string;
    }>;
  };
  category_ranges: any;
}

interface TestInterfaceProps {
  test: PsychologicalTest;
  onClose: () => void;
  onComplete: () => void;
}

const PsychologicalTestInterface = ({ test, onClose, onComplete }: TestInterfaceProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const interpretation = test.scoring_method.interpretation.find(
      interp => totalScore >= interp.min && totalScore <= interp.max
    );

    return {
      score: totalScore,
      category: interpretation?.category || 'Unknown',
      description: interpretation?.description || 'No interpretation available'
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const result = calculateScore();
      
      // For now, just show results (save to backend when migration is complete)
      setTestResult(result);
      setShowResults(true);
      
      toast({
        title: "Teste concluído!",
        description: "Os seus resultados foram calculados.",
      });
    } catch (error) {
      console.error('Error calculating test:', error);
      toast({
        title: "Erro",
        description: "Não foi possível calcular o teste. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const isLastQuestion = currentQuestion === test.questions.length - 1;
  const currentQuestionData = test.questions[currentQuestion];
  const hasAnsweredCurrent = answers[currentQuestionData?.id];
  const allAnswered = test.questions.every(q => answers[q.id] !== undefined);

  if (showResults && testResult) {
    return (
      <Card className="glass-effect border-accent-sage/20">
        <CardHeader>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Resultados do {test.test_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-blue mb-2">
              {testResult.score}
            </div>
            <div className="text-lg font-medium text-navy-blue mb-1">
              {testResult.category}
            </div>
            <div className="text-navy-blue/70 text-sm">
              de {test.scoring_method.total_points} pontos possíveis
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium text-navy-blue mb-2">Interpretação</h4>
            <p className="text-navy-blue/80 text-sm">{testResult.description}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium text-navy-blue mb-2">Importante</h4>
            <p className="text-navy-blue/80 text-sm">
              Este teste é apenas uma ferramenta de autoavaliação e não substitui uma avaliação profissional. 
              Se tem preocupações sobre a sua saúde mental, considere agendar uma consulta com um dos nossos especialistas.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-accent-sage to-mint-green text-white"
            >
              Concluir
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setTestResult(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Refazer Teste
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-accent-sage/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-sm text-navy-blue/70">
            Pergunta {currentQuestion + 1} de {test.questions.length}
          </div>
        </div>
        <CardTitle className="text-navy-blue flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {test.test_name}
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentQuestionData && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-navy-blue">
              {currentQuestionData.question}
            </h3>
            
            <RadioGroup
              value={answers[currentQuestionData.id]?.toString()}
              onValueChange={(value) => handleAnswer(currentQuestionData.id, parseInt(value))}
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label 
                    htmlFor={`option-${option.value}`} 
                    className="text-navy-blue cursor-pointer flex-1"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Privacy Option */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label htmlFor="anonymous" className="text-navy-blue">
              Fazer este teste de forma anónima
            </Label>
          </div>
          <p className="text-xs text-navy-blue/70">
            Se marcar esta opção, os resultados não serão associados ao seu perfil.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="bg-gradient-to-r from-accent-sage to-mint-green text-white"
            >
              {submitting ? 'A submeter...' : 'Concluir Teste'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
            >
              Próxima
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PsychologicalTestInterface;