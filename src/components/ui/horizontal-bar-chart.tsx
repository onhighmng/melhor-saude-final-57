import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, TrendingUp, Star } from 'lucide-react';

interface ChartCategoryData {
  key: string;
  data: number;
  color: string;
}

const categoryDataRaw: ChartCategoryData[] = [
  { key: 'Saúde Mental', data: 145, color: '#3B82F6' },
  { key: 'Bem-Estar Físico', data: 98, color: '#10B981' },
  { key: 'Assist. Financeira', data: 123, color: '#F59E0B' },
  { key: 'Assist. Jurídica', data: 87, color: '#8B5CF6' },
];

interface ResourceUsageCardProps {
  // Props can be added here for customization
}

function ResourceUsageCard({}: ResourceUsageCardProps): JSX.Element {
  const maxValue = Math.max(...categoryDataRaw.map(item => item.data));

  return (
    <Card className="border-0 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">
          Uso de Recursos por Pilar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horizontal Bar Chart */}
        <div className="space-y-4">
          {categoryDataRaw.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">{item.key}</span>
                <span className="font-bold text-foreground">{item.data}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(item.data / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600">
              <Eye className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">453</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Engajamento</span>
            </div>
            <p className="text-xl font-bold">68%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-600">
              <Star className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Top Pilar</span>
            </div>
            <p className="text-xl font-bold">Mental</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResourceUsageCard;
