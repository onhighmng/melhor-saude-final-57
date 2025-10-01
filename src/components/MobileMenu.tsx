
import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  title: string;
  key: string;
  hasDropdown: boolean;
  path?: string;
  onClick?: () => void;
  requiresAuth?: boolean;
  items?: { title: string; path?: string; onClick?: () => void }[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MobileMenu = ({ isOpen, onClose, menuItems }: MobileMenuProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const handleItemClick = (item: any) => {
    if (item.requiresAuth && (!item.items || item.items.length === 0) && item.onClick) {
      item.onClick();
      onClose();
    } else if (item.onClick && !item.hasDropdown) {
      // Handle onClick for items without dropdown
      item.onClick();
      onClose();
    } else if (item.hasDropdown) {
      toggleExpanded(item.key);
    } else if (item.path) {
      handleNavigation(item.path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="fixed inset-0 bg-white p-4 sm:p-8 overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Menu Content */}
        <div className="pt-12 sm:pt-16">
          {/* Logo */}
          <div className="flex items-center mb-6 sm:mb-8">
            <img 
              src="/lovable-uploads/18286dba-299d-452d-b21d-2860965d5785.png"
              alt="Melhor Saúde Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
            />
            <img 
              src="/lovable-uploads/aabc50f4-d72a-437d-b69f-ca359c4a49a5.png"
              alt="Melhor Saúde"
              className="h-5 sm:h-6"
            />
          </div>

          {/* Menu Items */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {menuItems.map((item) => (
              <div key={item.key}>
                <button
                  onClick={() => handleItemClick(item)}
                  className="flex items-center justify-between w-full text-base sm:text-lg font-medium py-2 sm:py-3 text-left"
                >
                  {item.title}
                  {item.hasDropdown && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedItems.includes(item.key) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                
                {item.hasDropdown && expandedItems.includes(item.key) && item.items && item.items.length > 0 && (
                  <div className="ml-4 space-y-2 mt-2">
                    {item.items.map((subItem, index) => (
                      <button
                        key={subItem.path || index}
                        onClick={() => {
                          if (subItem.onClick) {
                            subItem.onClick();
                            onClose();
                          } else if (subItem.path) {
                            handleNavigation(subItem.path);
                          }
                        }}
                        className="block w-full text-left py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-bright-royal transition-colors"
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-12">
            <button 
              onClick={() => handleNavigation('/login')}
              className="block w-full bg-white border border-gray-200 rounded-3xl px-6 py-3 sm:px-8 sm:py-4 text-center text-base sm:text-lg font-medium transition-all duration-300 hover:bg-navy-blue hover:text-white hover:border-navy-blue"
            >
              Entrar
            </button>
            <button 
              onClick={() => handleNavigation('/register/company')}
              className="block w-full bg-bright-royal text-white rounded-3xl px-6 py-3 sm:px-8 sm:py-4 text-center text-base sm:text-lg font-medium transition-colors duration-300 hover:bg-navy-blue"
            >
              Cadastrar-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
