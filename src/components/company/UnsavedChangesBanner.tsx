import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface UnsavedChangesBannerProps {
  onSave: () => void;
}

export function UnsavedChangesBanner({ onSave }: UnsavedChangesBannerProps) {
  const { t } = useTranslation();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warm-orange/10 border-b border-warm-orange">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-warm-orange">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">{t('warnings.unsavedChanges')}</span>
        </div>
        <Button onClick={onSave} variant="default" size="sm">
          {t('buttons.save')}
        </Button>
      </div>
    </div>
  );
}
