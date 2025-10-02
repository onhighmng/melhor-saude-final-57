import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Bell } from "lucide-react";
import { userUIcopy } from "@/data/userUIcopy";

interface FirstStepsProps {
  onBookSession: () => void;
}

const steps = [
  {
    icon: Calendar,
    title: "Agende a Sua Primeira Sessão",
    description: "Escolha a área de apoio e o especialista que melhor se adapta às suas necessidades",
  },
  {
    icon: BookOpen,
    title: "Explore os Recursos",
    description: "Aceda a artigos, vídeos e guias sobre bem-estar e desenvolvimento pessoal",
  },
  {
    icon: Bell,
    title: "Ative as Notificações",
    description: "Receba lembretes das suas sessões e avisos importantes",
  },
];

export function FirstSteps({ onBookSession }: FirstStepsProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Próximos Passos</CardTitle>
          <CardDescription>
            Está tudo pronto! Aqui estão algumas sugestões para começar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button onClick={onBookSession} size="lg" className="w-full">
            {userUIcopy.onboarding.ctaFirstSession}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
