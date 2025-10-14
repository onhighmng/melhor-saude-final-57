import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Calendar,
  Users,
  Video,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Eye
} from 'lucide-react';
import { mockCompanySessions } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";

const CompanySessions = () => {
  return (
    <div className="space-y-8">
      {/* Access Restricted Message */}
      <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Dados Anonimizados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Por motivos de privacidade e proteção de dados pessoais, os detalhes individuais das sessões 
            dos colaboradores não estão disponíveis. Consulte os <strong>Relatórios e Impacto</strong> para 
            análises agregadas e estatísticas anónimas sobre a utilização dos serviços.
          </p>
        </CardContent>
      </Card>
    </div>
  );

};

export default CompanySessions;
