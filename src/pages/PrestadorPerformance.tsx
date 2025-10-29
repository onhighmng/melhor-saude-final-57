import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  mockPrestadorPerformance, 
  mockSessionEvolution, 
  mockFinancialData 
} from '@/data/prestadorMetrics';
import { PrestadorPerformanceFeatures } from '@/components/ui/prestador-performance-features';

const PrestadorPerformance = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportReport = async () => {
    setIsExporting(true);
    
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "Relatório mensal foi gerado em CSV com sucesso"
      });
      setIsExporting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 -m-6">
      <PrestadorPerformanceFeatures
        performance={mockPrestadorPerformance}
        sessionEvolution={mockSessionEvolution}
        financialData={mockFinancialData}
        onExportReport={handleExportReport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default PrestadorPerformance;
