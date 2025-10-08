
import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface NavigationActionsProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onMobileMenuOpen: () => void;
  onLogoutClick?: () => void;
  isAuthenticated?: boolean;
  user?: { name: string; email: string; role?: string } | null;
}

const NavigationActions = ({ 
  onLoginClick, 
  onRegisterClick, 
  onMobileMenuOpen,
  onLogoutClick,
  isAuthenticated = false,
  user
}: NavigationActionsProps) => {
  const { t } = useTranslation(['navigation', 'common']);
  
  return (
    <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Desktop Actions */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {isAuthenticated && user ? (
          <>
            {/* User greeting */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>{t('common:greeting', { name: user.name })}</span>
            </div>
            
            {/* Logout button */}
            <button 
              onClick={onLogoutClick}
              className="group relative flex items-center justify-center gap-1 h-10 px-3 bg-white/30 backdrop-blur-sm border border-accent-sage/20 rounded-lg text-sm leading-6 transition-all duration-300 overflow-hidden hover:bg-white/40"
            >
              <LogOut className="w-4 h-4" />
              <div className="relative z-10">{t('common:logout')}</div>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onLoginClick}
              className="flex items-center justify-center h-10 px-6 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
            >
              {t('common:login')}
            </button>
            <button 
              onClick={onRegisterClick}
              className="flex items-center justify-center h-10 px-6 bg-vibrant-blue text-white rounded-lg text-sm font-medium transition-all duration-200 hover:bg-bright-royal whitespace-nowrap"
            >
              {t('common:register')}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
};

export default NavigationActions;
