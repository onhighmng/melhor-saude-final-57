import React from 'react';
import { ChevronDown } from 'lucide-react';
import { MenuItem } from './types';
import PillarDropdown from './PillarDropdown';
import AuthenticatedDropdown from './AuthenticatedDropdown';

interface DesktopMenuProps {
  menuItems: MenuItem[];
  activeDropdown: string | null;
  onDropdownToggle: (dropdown: string) => void;
  onNavigation: (path: string) => void;
}

const DesktopMenu = ({ menuItems, activeDropdown, onDropdownToggle, onNavigation }: DesktopMenuProps) => {
  const handleMenuItemClick = (item: MenuItem) => {
    console.log('[Menu] Item clicked:', item.title, 'requiresAuth:', item.requiresAuth, 'hasItems:', item.items?.length);
    
    if (item.onClick) {
      console.log('[Menu] Executing onClick for:', item.title);
      item.onClick();
    }
  };

  const handleAuthRedirect = (item: MenuItem) => {
    console.log('[Auth] Auth redirect for:', item.title);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 lg:gap-6 overflow-visible">
      {menuItems.filter(item => 
        // Only show these items on mobile and below lg
        item.key === 'sobre' || item.key === 'pilares'
      ).map((item) => (
        <div key={item.key} className="relative lg:hidden">
          {item.key === 'pilares' ? (
            // Use dedicated pillar dropdown
            <PillarDropdown />
          ) : (
            // Regular menu item without dropdown
            <button
              onClick={() => handleMenuItemClick(item)}
              className="text-navy-blue hover:text-bright-royal transition-colors duration-200 font-medium text-sm h-10 px-3 rounded-lg hover:bg-white/20 flex items-center justify-center whitespace-nowrap"
            >
              {item.title}
            </button>
          )}
        </div>
      ))}
      
      {/* Show all items on desktop (lg and above) */}
      <div className="hidden lg:flex items-center gap-6 overflow-visible">
        {menuItems.map((item) => (
          <div key={item.key} className="relative">
            {item.key === 'pilares' ? (
              // Use dedicated pillar dropdown
              <PillarDropdown />
            ) : item.requiresAuth && item.hasDropdown ? (
              // Use authenticated dropdown for auth-required items
              <AuthenticatedDropdown
                title={item.title}
                items={item.items || []}
                isAuthenticated={!item.requiresAuth || (item.items && item.items.length > 0)}
                onAuthRedirect={() => handleAuthRedirect(item)}
              />
            ) : !item.hasDropdown ? (
              // Regular menu item without dropdown
              <button
                onClick={() => handleMenuItemClick(item)}
                className="text-navy-blue hover:text-bright-royal transition-colors duration-200 font-medium h-10 px-4 rounded-lg hover:bg-white/20 flex items-center justify-center"
              >
                {item.title}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopMenu;