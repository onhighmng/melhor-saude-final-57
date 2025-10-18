import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function DemoAccessButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <Button
      onClick={() => navigate('/demo')}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg bg-background/95 backdrop-blur-sm hover:bg-accent flex items-center gap-2"
    >
      <Play className="h-4 w-4" />
      {t('demo.accessDemo') || 'Demo Mode'}
    </Button>
  );
}
