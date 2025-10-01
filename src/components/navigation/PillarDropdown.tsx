import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePillarNavigation } from '@/hooks/usePillarNavigation';
import { pillars } from '@/components/info-cards/InfoCardsData';

const PILLARS = pillars.map((pillar, index) => ({
  id: `pillar-${index}`,
  label: pillar.title,
  pillarIndex: index
}));

interface PillarDropdownProps {
  onClose?: () => void;
}

const PillarDropdownCore: React.FC<PillarDropdownProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollToPillar } = usePillarNavigation();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[PillarDropdown] Toggle clicked - current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('[PillarDropdown] Setting isOpen to:', !isOpen);
  };

  const handlePillarClick = (pillar: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[Pillar] Clicking pillar: ${pillar.label} (index: ${pillar.pillarIndex})`);
    setIsOpen(false);
    onClose?.();
    scrollToPillar(pillar.pillarIndex);
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-navy-blue hover:text-bright-royal transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>4 Pilares</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                type="button"
                onClick={(e) => handlePillarClick(pillar, e)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 border-none bg-transparent"
              >
                {pillar.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PillarDropdown: React.FC<PillarDropdownProps> = (props) => {
  return <PillarDropdownCore {...props} />;
};

export default PillarDropdown;