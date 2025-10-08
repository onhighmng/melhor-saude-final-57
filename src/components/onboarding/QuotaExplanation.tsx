import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Scale, DollarSign, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface QuotaExplanationProps {
  companySessions: number;
  personalSessions: number;
  onContinue: () => void;
}

export function QuotaExplanation({ companySessions, personalSessions, onContinue }: QuotaExplanationProps) {
  const { t } = useTranslation('common');
  
  const pillars = [
    {
      icon: Brain,
      titleKey: 'onboarding.pillarDescriptions.mentalHealth.title',
      descriptionKey: 'onboarding.pillarDescriptions.mentalHealth.description',
    },
    {
      icon: Heart,
      titleKey: 'onboarding.pillarDescriptions.physicalWellness.title',
      descriptionKey: 'onboarding.pillarDescriptions.physicalWellness.description',
    },
    {
      icon: DollarSign,
      titleKey: 'onboarding.pillarDescriptions.financialAssistance.title',
      descriptionKey: 'onboarding.pillarDescriptions.financialAssistance.description',
    },
    {
      icon: Scale,
      titleKey: 'onboarding.pillarDescriptions.legalAssistance.title',
      descriptionKey: 'onboarding.pillarDescriptions.legalAssistance.description',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('onboarding.yourSupportSessions')}</CardTitle>
          <CardDescription>
            {t('onboarding.quotaExplanation')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quota Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{companySessions}</p>
              <p className="text-sm text-muted-foreground">{t('onboarding.companySessions')}</p>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-secondary">{personalSessions}</p>
              <p className="text-sm text-muted-foreground">{t('onboarding.personalSessions')}</p>
            </div>
          </div>
          
          {/* Pillars */}
          <div className="space-y-3">
            <h4 className="font-semibold">{t('onboarding.supportAreasAvailable')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.titleKey} className="flex gap-3 p-3 border rounded-lg">
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{t(pillar.titleKey)}</h5>
                      <p className="text-xs text-muted-foreground">{t(pillar.descriptionKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button onClick={onContinue} size="lg" className="w-full">
            {t('onboarding.steps.bookFirstSession.title')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
