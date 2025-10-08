import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Scale, DollarSign, ArrowRight } from "lucide-react";
import { userUIcopy } from "@/data/userUIcopy";

interface QuotaExplanationProps {
  companySessions: number;
  personalSessions: number;
  onContinue: () => void;
}

const pillars = [
  {
    icon: Brain,
    title: "Saúde Mental",
    description: "Apoio psicológico profissional",
  },
  {
    icon: Heart,
    title: "Bem-Estar Físico",
    description: "Nutrição, fitness e saúde",
  },
  {
    icon: DollarSign,
    title: "Assistência Financeira",
    description: "Planeamento e educação financeira",
  },
  {
    icon: Scale,
    title: "Assistência Jurídica",
    description: "Consultoria legal personalizada",
  },
];

export function QuotaExplanation({ companySessions, personalSessions, onContinue }: QuotaExplanationProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">As Suas Sessões de Apoio</CardTitle>
          <CardDescription>
            {userUIcopy.onboarding.quotaExplanation}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quota Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{companySessions}</p>
              <p className="text-sm text-muted-foreground">Sessões da Empresa</p>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-secondary">{personalSessions}</p>
              <p className="text-sm text-muted-foreground">Sessões Pessoais</p>
            </div>
          </div>
          
          {/* Pillars */}
          <div className="space-y-3">
            <h4 className="font-semibold">Áreas de Apoio Disponíveis:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="flex gap-3 p-3 border rounded-lg">
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{pillar.title}</h5>
                      <p className="text-xs text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button onClick={onContinue} size="lg" className="w-full">
            {userUIcopy.onboarding.ctaUnderstood}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
