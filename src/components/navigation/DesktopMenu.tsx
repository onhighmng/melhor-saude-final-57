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
  const [localActiveDropdown, setLocalActiveDropdown] = React.useState<string | null>(null);

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const handleAuthRedirect = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const handleDropdownItemClick = (itemOnClick?: () => void) => {
    if (itemOnClick) {
      itemOnClick();
    }
    setLocalActiveDropdown(null);
  };

  const toggleDropdown = (key: string) => {
    setLocalActiveDropdown(localActiveDropdown === key ? null : key);
  };

  React.useEffect(() => {
    if (!localActiveDropdown) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setLocalActiveDropdown(null);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [localActiveDropdown]);

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
          <div key={item.key} className="relative dropdown-container">
            {item.key === 'pilares' ? (
              // Use dedicated pillar dropdown
              <PillarDropdown />
            ) : item.hasDropdown && item.items ? (
              // Generic dropdown for role-specific menus
              <div className="relative overflow-visible">
                <button
                  type="button"
                  onClick={() => toggleDropdown(item.key)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-navy-blue hover:text-bright-royal transition-colors duration-200"
                  aria-expanded={localActiveDropdown === item.key}
                  aria-haspopup="true"
                >
                  <span>{item.title}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${localActiveDropdown === item.key ? 'rotate-180' : ''}`} />
                </button>

                {localActiveDropdown === item.key && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {item.items.map((dropdownItem, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDropdownItemClick(dropdownItem.onClick)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 border-none bg-transparent"
                        >
                          {dropdownItem.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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