
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ConsultasRestantesTileProps {
  consultasRestantes: number;
}

const ConsultasRestantesTile = ({ consultasRestantes }: ConsultasRestantesTileProps) => {
  return (
    <Card className="bg-white/20 backdrop-blur-md border border-accent-sage/10 hover:bg-white/30 transition-all duration-300 mb-6">
      <CardContent className="p-4">
        <div className="text-center">
          <span className="text-navy-blue font-bold text-lg">
            Consultas restantes patrocinadas pelo empregador: {consultasRestantes}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultasRestantesTile;
