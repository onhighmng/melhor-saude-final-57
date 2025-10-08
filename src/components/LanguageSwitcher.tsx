import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common');
  const { toast } = useToast();
  const [currentLang, setCurrentLang] = useState<string>('pt');

  // Normalize language code (pt-BR → pt, en-US → en)
  const normalizeLanguage = (lang: string): string => {
    return lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  };

  // Update current language when i18n changes
  useEffect(() => {
    const normalized = normalizeLanguage(i18n.language);
    setCurrentLang(normalized);
    
    // Ensure i18n is using normalized language
    if (i18n.language !== normalized) {
      i18n.changeLanguage(normalized);
    }
  }, [i18n.language]);

  const toggleLanguage = async () => {
    try {
      const newLang = currentLang === 'pt' ? 'en' : 'pt';
      await i18n.changeLanguage(newLang);
      setCurrentLang(newLang);
      
      // Show confirmation toast
      toast({
        title: t(`languageChanged.${newLang === 'pt' ? 'toPT' : 'toEN'}`),
        duration: 2000,
      });
      
      // Force page re-render by triggering storage event
      window.dispatchEvent(new Event('languageChanged'));
    } catch (error) {
      console.error('Language change failed:', error);
      toast({
        title: t('errors:languageChangeFailed'),
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 hover:bg-accent/20 transition-colors"
      aria-label={t('changeLanguage', { 
        currentLang: currentLang.toUpperCase(),
        targetLang: currentLang === 'pt' ? 'EN' : 'PT'
      })}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium uppercase">
        {currentLang.toUpperCase()}
      </span>
    </Button>
  );
};
