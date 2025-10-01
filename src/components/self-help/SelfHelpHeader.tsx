import React from 'react';
import { Book, Heart, Scale, Stethoscope, Sparkles } from 'lucide-react';

interface SelfHelpHeaderProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const SelfHelpHeader: React.FC<SelfHelpHeaderProps> = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    { id: null, name: 'Todos', icon: Book, color: 'bg-primary' },
    { id: 'psicologica', name: 'Psicológica', icon: Heart, color: 'bg-red-500' },
    { id: 'juridica', name: 'Jurídica', icon: Scale, color: 'bg-blue-500' },
    { id: 'medica', name: 'Médica', icon: Stethoscope, color: 'bg-green-500' }
  ];

  return (
    <div className="glass-effect border-accent-sage/20 rounded-2xl p-8 mb-8 hover:shadow-custom-lg transition-smooth">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-blue mb-4 animate-fade-in flex items-center justify-center gap-3">
          Centro de Autoajuda <Sparkles className="h-10 w-10 text-yellow-500" />
        </h1>
        <p className="text-xl text-navy-blue/80 max-w-2xl mx-auto animate-fade-in">
          Recursos abrangentes para apoiar o seu bem-estar em todas as áreas da vida
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id || 'all'}
              onClick={() => onCategorySelect(category.id)}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 hover-scale
                animate-fade-in glass-effect
                ${isSelected 
                  ? 'bg-gradient-to-r from-accent-sky to-vibrant-blue text-white shadow-custom-lg scale-105' 
                  : 'bg-white/40 backdrop-blur-md text-navy-blue hover:bg-white/60 border border-accent-sage/20'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon size={20} />
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelfHelpHeader;