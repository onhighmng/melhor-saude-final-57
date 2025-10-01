import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ChangeRequest {
  id: number;
  user: string;
  pillar: string;
  currentProvider: string;
  requestedProvider: string;
  status: string;
}

interface ChangeRequestsQueueProps {
  changeRequests: ChangeRequest[];
  getStatusBadge: (status: string) => React.ReactElement;
}

const ChangeRequestsQueue = ({ changeRequests, getStatusBadge }: ChangeRequestsQueueProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="hover-lift h-fit max-h-48">
      <CardHeader 
        className="pb-2 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1 bg-amber-100 dark:bg-amber-900/20 rounded-sm">
              <Clock className="h-3 w-3 text-amber-600" />
            </div>
            Pedidos de Troca
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs px-1.5 py-0.5">
              {changeRequests.length}
            </Badge>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
              {isExpanded ? (
                <ChevronUp className="h-2.5 w-2.5" />
              ) : (
                <ChevronDown className="h-2.5 w-2.5" />
              )}
            </Button>
          </div>
        </div>
        
        {!isExpanded && changeRequests.length > 0 && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-sm border border-amber-200 dark:border-amber-800/30">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className="font-medium">{changeRequests[0].user}</span>
                <div className="text-muted-foreground text-xs">{changeRequests[0].pillar}</div>
              </div>
              <div className="scale-75">
                {getStatusBadge(changeRequests[0].status)}
              </div>
            </div>
            {changeRequests.length > 1 && (
              <div className="text-xs text-muted-foreground mt-1">
                +{changeRequests.length - 1} mais
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 animate-fade-in">
          {changeRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-3 space-y-2 bg-background/50 hover:bg-background/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{request.user}</span>
                {getStatusBadge(request.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                <p><strong>{request.pillar}</strong></p>
                <p>De: {request.currentProvider}</p>
                <p>Para: {request.requestedProvider}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs h-7 hover-scale">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aprovar
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7 hover-scale">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default ChangeRequestsQueue;