import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Bell } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface FirstStepsProps {
  onBookSession: () => void;
}

export function FirstSteps({ onBookSession }: FirstStepsProps) {
  const { t } = useTranslation('common');
  
  const steps = [
    {
      icon: Calendar,
      titleKey: 'onboarding.steps.bookFirstSession.title',
      descriptionKey: 'onboarding.steps.bookFirstSession.description',
    },
    {
      icon: BookOpen,
      titleKey: 'onboarding.steps.exploreResources.title',
      descriptionKey: 'onboarding.steps.exploreResources.description',
    },
    {
      icon: Bell,
      titleKey: 'onboarding.steps.enableNotifications.title',
      descriptionKey: 'onboarding.steps.enableNotifications.description',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('onboarding.nextSteps')}</CardTitle>
          <CardDescription>
            {t('onboarding.allReady')}
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
                    <h4 className="font-semibold mb-1">{t(step.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(step.descriptionKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button onClick={onBookSession} size="lg" className="w-full">
            {t('onboarding.steps.bookFirstSession.title')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
