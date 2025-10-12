import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";

interface PostBookingPromptProps {
  providerName: string;
  sessionDate: string;
  sessionTime: string;
  pillar: string;
  onStartPreDiagnosis: () => void;
  onSkip: () => void;
}

export function PostBookingPrompt({
  providerName,
  sessionDate,
  sessionTime,
  pillar,
  onStartPreDiagnosis,
  onSkip,
}: PostBookingPromptProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sessão Agendada com Sucesso!</CardTitle>
          <CardDescription>
            {providerName} • {sessionDate} às {sessionTime}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Maximize a sua sessão</h4>
            <p className="text-sm text-muted-foreground">
              Responda a algumas perguntas antes da consulta para ajudar {providerName} a 
              preparar-se melhor e tornar a sessão mais eficaz.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onStartPreDiagnosis}
              size="lg"
              className="w-full"
            >
              Iniciar Pré-Diagnóstico
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={onSkip}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
