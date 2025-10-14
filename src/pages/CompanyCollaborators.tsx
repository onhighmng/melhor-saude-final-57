import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Users,
  Star,
  Clock,
  Target,
  TrendingUp,
  Brain,
  Heart,
  DollarSign,
  Scale,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockCompanyCollaborators } from '@/data/companyMetrics';
import { useToast } from "@/hooks/use-toast";

const CompanyCollaborators = () => {
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
            Por motivos de privacidade e proteção de dados pessoais, os dados individuais dos colaboradores 
            não estão disponíveis nesta vista. Consulte os <strong>Relatórios e Impacto</strong> para análises 
            agregadas e anónimas sobre o bem-estar da sua equipa.
          </p>
        </CardContent>
      </Card>
    </div>
  );

};

export default CompanyCollaborators;
