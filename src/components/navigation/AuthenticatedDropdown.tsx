
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DropdownItem {
  title: string;
  path?: string;
  onClick?: () => void;
}

interface AuthenticatedDropdownProps {
  title: string;
  items: DropdownItem[];
  isAuthenticated: boolean;
  onAuthRedirect: () => void;
}

const AuthenticatedDropdown = ({ 
  title, 
  items, 
  isAuthenticated, 
  onAuthRedirect 
}: AuthenticatedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      console.log('🔒 Auth required for:', title);
      onAuthRedirect();
      return;
    }

    if (items.length === 0) {
      console.log('⚠️ No items in dropdown for:', title);
      return;
    }

    console.log('📋 Toggling dropdown for:', title, 'isOpen:', !isOpen);
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem, event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🎯 Dropdown item clicked:', item.title, 'path:', item.path);
    
    // Close dropdown immediately
    setIsOpen(false);
    
    // Execute the action
    if (item.onClick) {
      console.log('🔄 Executing onClick for:', item.title);
      item.onClick();
    } else if (item.path) {
      console.log('🚀 Navigating to:', item.path);
      navigate(item.path);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isAuthenticated) {
        onAuthRedirect();
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleItemKeyDown = (item: DropdownItem, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(item, event);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      role="menubar"
    >
      <button
        type="button"
        className="flex items-center gap-2 text-base leading-6 tracking-tight transition-opacity duration-200 hover:opacity-70 cursor-pointer focus:outline-none focus:opacity-70"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${title} menu`}
      >
        {title}
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && isAuthenticated && items.length > 0 && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white backdrop-blur-xl rounded-xl p-2 min-w-[250px] border border-gray-200 shadow-xl z-50"
          role="menu"
          aria-label={`${title} submenu`}
        >
          {items.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              type="button"
              role="menuitem"
              tabIndex={0}
              className="block w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              onClick={(event) => handleItemClick(item, event)}
              onKeyDown={(event) => handleItemKeyDown(item, event)}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthenticatedDropdown;
