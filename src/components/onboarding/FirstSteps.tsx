import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Bell } from "lucide-react";

interface FirstStepsProps {
  onBookSession: () => void;
}

export function FirstSteps({ onBookSession }: FirstStepsProps) {
  const steps = [
    {
      icon: Calendar,
      title: 'Agendar Primeira Sessão',
      description: 'Reserve uma sessão com um dos nossos especialistas',
    },
    {
      icon: BookOpen,
      title: 'Explorar Recursos',
      description: 'Aceda a materiais educativos e ferramentas de apoio',
    },
    {
      icon: Bell,
      title: 'Ativar Notificações',
      description: 'Mantenha-se informado sobre as suas sessões e objetivos',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Próximos Passos</CardTitle>
          <CardDescription>
            Tudo pronto!
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
            Agendar Primeira Sessão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}