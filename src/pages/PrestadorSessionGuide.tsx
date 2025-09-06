import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, FileText, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function PrestadorSessionGuide() {
  const guideSteps = [
    {
      title: "Preparação da Sessão",
      icon: Calendar,
      content: [
        "Confirme o horário e duração da sessão",
        "Prepare o ambiente de trabalho",
        "Revise o histórico do paciente se necessário",
        "Teste a conexão de internet e equipamentos"
      ]
    },
    {
      title: "Durante a Sessão",
      icon: Users,
      content: [
        "Chegue 5 minutos antes do horário marcado",
        "Mantenha um ambiente profissional",
        "Tome notas relevantes durante a consulta",
        "Respeite rigorosamente o tempo da sessão"
      ]
    },
    {
      title: "Após a Sessão",
      icon: FileText,
      content: [
        "Complete as notas da sessão imediatamente",
        "Marque próximas consultas se necessário",
        "Envie recomendações por escrito se aplicável",
        "Atualize o status da sessão no sistema"
      ]
    },
    {
      title: "Gestão de Horários",
      icon: Clock,
      content: [
        "Mantenha sua disponibilidade sempre atualizada",
        "Comunique mudanças com antecedência",
        "Respeite os intervalos entre sessões",
        "Use o sistema de agendamento para tudo"
      ]
    }
  ];

  const bestPractices = [
    "Seja pontual e profissional em todas as interações",
    "Mantenha a confidencialidade dos pacientes",
    "Documente adequadamente todas as sessões",
    "Responda às mensagens dentro de 24 horas",
    "Atualize seu perfil e disponibilidade regularmente"
  ];

  const commonIssues = [
    {
      issue: "Paciente não comparece",
      solution: "Entre em contato para reagendar. Marque a ausência no sistema."
    },
    {
      issue: "Problemas técnicos",
      solution: "Tenha sempre um plano B. Use telefone como backup se necessário."
    },
    {
      issue: "Sessão excede o tempo",
      solution: "Gerencie o tempo ativamente. Avise 10 minutos antes do final."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Guia de Sessões</h1>
        <p className="text-muted-foreground mt-2">
          Orientações completas para conduzir sessões eficazes e profissionais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {guideSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {step.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Melhores Práticas
          </CardTitle>
          <CardDescription>
            Diretrizes essenciais para prestação de serviços de qualidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Situações Comuns e Soluções
          </CardTitle>
          <CardDescription>
            Como lidar com desafios frequentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commonIssues.map((item, index) => (
              <div key={index}>
                <h4 className="font-medium text-sm mb-1">{item.issue}</h4>
                <p className="text-sm text-muted-foreground">{item.solution}</p>
                {index < commonIssues.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}