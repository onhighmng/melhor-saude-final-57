import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SpecialistChoiceProps {
  onChooseAI: () => void;
  onChooseHuman: () => void;
  onBack: () => void;
}

const SpecialistChoice: React.FC<SpecialistChoiceProps> = ({
  onChooseAI,
  onChooseHuman,
  onBack
}) => {
  const { t } = useTranslation('user');
  
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            {t('booking.backButton')}
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {t('booking.specialistChoice.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('booking.specialistChoice.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
              onClick={onChooseAI}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{t('booking.specialistChoice.ai.title')}</h3>
                <p className="text-muted-foreground">
                  {t('booking.specialistChoice.ai.legalAssistance')}
                </p>
                <Button className="w-full mt-4">
                  {t('booking.specialistChoice.ai.button')}
                </Button>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
              onClick={onChooseHuman}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{t('booking.specialistChoice.specialist.title')}</h3>
                <p className="text-muted-foreground">
                  {t('booking.specialistChoice.specialist.legalAssistance')}
                </p>
                <Button className="w-full mt-4">
                  {t('booking.specialistChoice.specialist.button')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistChoice;
