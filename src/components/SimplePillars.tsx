import React from 'react';

const SimplePillars = () => {
  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Como podemos ajudar?
          </h2>
          <p className="text-xl text-gray-600">
            Selecione a área em que precisa de apoio
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 h-96">
          {/* Mental Health */}
          <div className="bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-blue-200 transition-colors">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Saúde Mental</h3>
            <p className="text-sm text-blue-600">Apoio psicológico e bem-estar emocional</p>
          </div>

          {/* Physical Well-being */}
          <div className="bg-orange-100 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-orange-200 transition-colors">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">❤️</span>
            </div>
            <h3 className="text-xl font-bold text-orange-600 mb-2">Bem-estar Físico</h3>
            <p className="text-sm text-orange-600">Saúde física e qualidade de vida</p>
          </div>

          {/* Financial Assistance */}
          <div className="bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-green-200 transition-colors">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Assistência Financeira</h3>
            <p className="text-sm text-green-600">Consultoria financeira e planeamento</p>
          </div>

          {/* Legal Assistance */}
          <div className="bg-purple-100 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-purple-200 transition-colors">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Assistência Jurídica</h3>
            <p className="text-sm text-purple-600">Apoio e aconselhamento legal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePillars;
