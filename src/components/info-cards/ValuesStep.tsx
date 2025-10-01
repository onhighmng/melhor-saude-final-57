
import React from 'react';
import { values } from './InfoCardsData';

interface ValuesStepProps {
  isVisible: boolean;
  onImplementPillars: () => void;
  onLearnMore: () => void;
}

const ValuesStep: React.FC<ValuesStepProps> = ({ isVisible, onImplementPillars, onLearnMore }) => {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center transition-all duration-1200 ease-out ${
        isVisible ? 'opacity-100 visible transform translate-y-0 scale-100' : 'opacity-0 invisible transform translate-y-16 scale-90'
      }`}
    >
      <div className="text-center text-navy-blue max-w-4xl mx-auto p-8">
        <h3 className="text-4xl font-bold mb-6 text-navy-blue animate-fade-in">
          Nossos Valores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {values.map((value, index) => (
            <div 
              key={index} 
              className="text-center animate-fade-in hover:transform hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-4xl mb-4 animate-bounce animation-delay-500">{value.icon}</div>
              <h4 className="text-xl font-semibold mb-3 text-navy-blue">{value.title}</h4>
              <p className="text-cool-grey leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-mint-green/30 to-sky-blue/30 rounded-2xl p-8 mb-8 shadow-lg border border-cool-grey/20 animate-fade-in animation-delay-600 hover:shadow-xl transition-all duration-500">
          <h4 className="text-2xl font-bold mb-6 text-navy-blue">Resultados Comprovados</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center animate-scale-in animation-delay-800">
              <div className="text-3xl font-bold text-mint-green mb-2">500+</div>
              <p className="text-cool-grey">Empresas Parceiras</p>
            </div>
            <div className="text-center animate-scale-in animation-delay-1000">
              <div className="text-3xl font-bold text-sky-blue mb-2">25k</div>
              <p className="text-cool-grey">Utilizadores Ativos</p>
            </div>
            <div className="text-center animate-scale-in animation-delay-1200">
              <div className="text-3xl font-bold text-royal-blue mb-2">98%</div>
              <p className="text-cool-grey">Satisfação</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-1400">
          <button 
            onClick={onImplementPillars}
            className="bg-royal-blue text-white px-8 py-3 rounded-2xl font-semibold hover:bg-navy-blue transition-all duration-500 hover:scale-110 transform shadow-lg hover:shadow-xl"
          >
            Implementar os 4 Pilares
          </button>
          <button 
            onClick={onLearnMore}
            className="bg-soft-white text-royal-blue border-2 border-royal-blue px-8 py-3 rounded-2xl font-semibold hover:bg-sky-blue/10 transition-all duration-500 hover:scale-110 transform shadow-lg hover:shadow-xl"
          >
            Saber mais
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValuesStep;
