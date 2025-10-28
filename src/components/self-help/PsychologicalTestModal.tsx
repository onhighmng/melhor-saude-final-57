import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PsychologicalTest, TestResult } from '@/types/selfHelp';
import { useTestResults } from '@/hooks/useSelfHelp';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface PsychologicalTestModalProps {
  test: PsychologicalTest;
  isOpen: boolean;
  onClose: () => void;
}

const PsychologicalTestModal: React.FC<PsychologicalTestModalProps> = ({ 
  test, 
  isOpen, 
  onClose 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  
  const { submitTestResult, submitting } = useTestResults();
  const { user } = useAuth();

  const calculateScore = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    return totalScore;
  };

  const getInterpretation = (score: number) => {
    const ranges = test.interpretation_guide.ranges;
    const matchingRange = ranges.find(range => score >= range.min && score <= range.max);
    return matchingRange?.description || 'Pontuação fora do intervalo esperado';
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleSubmitTest = async () => {
    const score = calculateScore();
    const interpretation = getInterpretation(score);
    
    const result = await submitTestResult(
      test.id,
      answers,
      score,
      interpretation,
      isAnonymous,
      consentGiven
    );
    
    if (result) {
      setTestResult(result);
      setShowResults(true);
    }
  };

  const handleStartOver = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowConsent(true);
    setShowResults(false);
    setTestResult(null);
    setIsAnonymous(true);
    setConsentGiven(false);
  };

  const handleClose = () => {
    handleStartOver();
    onClose();
  };

  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const isQuestionAnswered = answers[test.questions[currentQuestion]?.id] !== undefined;
  const allQuestionsAnswered = test.questions.every(q => answers[q.id] !== undefined);

  if (showResults && testResult) {
    const score = testResult.score;
    const interpretation = testResult.interpretation;
    const maxScore = test.scoring_rules.total_possible;
    const percentage = (score / maxScore) * 100;

    const getResultColor = () => {
      if (percentage <= 25) return 'text-green-600';
      if (percentage <= 50) return 'text-yellow-600';
      if (percentage <= 75) return 'text-orange-600';
      return 'text-red-600';
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Resultado do Teste
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">{test.name}</h3>
              <div className={`text-3xl font-bold ${getResultColor()}`}>
                {score} / {maxScore}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interpretação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {interpretation}
                </p>
              </CardContent>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>{test.interpretation_guide.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleStartOver} className="flex-1">
                Fazer Novamente
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showConsent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {test.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {test.description}
            </p>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Termos e Privacidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Realizar teste anonimamente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Os seus resultados não serão associados à sua conta
                    </p>
                  </div>
                </div>

                {user && !isAnonymous && (
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={consentGiven}
                      onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Autorizo o armazenamento dos meus resultados
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Os resultados serão guardados na sua conta para consulta futura
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Nota importante:</strong> Este questionário é apenas uma ferramenta de rastreio. 
                    Para um diagnóstico adequado, consulte sempre um profissional de saúde mental.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={() => setShowConsent(false)} 
                className="flex-1"
                disabled={!isAnonymous && user && !consentGiven}
              >
                Começar Teste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const question = test.questions[currentQuestion];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {test.name}
          </DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pergunta {currentQuestion + 1} de {test.questions.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
                className="space-y-3"
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label 
                      htmlFor={`option-${option.value}`} 
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isQuestionAnswered || submitting}
              className="flex items-center gap-2"
            >
              {currentQuestion === test.questions.length - 1 ? (
                submitting ? 'A submeter...' : 'Finalizar'
              ) : (
                <>
                  Próxima
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {currentQuestion === test.questions.length - 1 && allQuestionsAnswered && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Pronto para finalizar!</strong> Clique em "Finalizar" para ver os seus resultados.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PsychologicalTestModal;