import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      aria-label="Change language"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium uppercase">
        {i18n.language === 'pt' ? 'EN' : 'PT'}
      </span>
    </Button>
  );
};
