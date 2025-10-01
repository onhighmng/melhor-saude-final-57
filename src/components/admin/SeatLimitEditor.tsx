import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Save, AlertTriangle, Info, History } from "lucide-react";
import { Company, updateSeatLimit, getActiveUsers } from "@/data/companyMockData";
import { useToast } from "@/hooks/use-toast";

interface SeatLimitEditorProps {
  company: Company;
  onUpdate?: (updatedCompany: Company) => void;
}

export function SeatLimitEditor({ company, onUpdate }: SeatLimitEditorProps) {
  const [newLimit, setNewLimit] = useState(company.seatLimit.toString());
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const activeUsersCount = getActiveUsers(company).length;
  const proposedLimit = parseInt(newLimit) || 0;
  const isValidLimit = proposedLimit >= activeUsersCount;
  const hasChanges = proposedLimit !== company.seatLimit;

  const handleSave = () => {
    if (!isValidLimit) {
      toast({
        title: "Limite inválido",
        description: `O limite deve ser pelo menos ${activeUsersCount} (utilizadores ativos atuais).`,
        variant: "destructive"
      });
      return;
    }

    const updatedCompany = updateSeatLimit(company, proposedLimit);
    onUpdate?.(updatedCompany);
    setIsEditing(false);
    
    toast({
      title: "Limite atualizado",
      description: `Limite de contas definido para ${proposedLimit}.`,
      variant: "default"
    });
  };

  const handleCancel = () => {
    setNewLimit(company.seatLimit.toString());
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Limite de Contas</span>
          <Badge variant="outline">Admin</Badge>
        </CardTitle>
        <CardDescription>
          Defina o número máximo de contas ativas para esta empresa
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Estado Atual:</span>
            <Badge variant={company.isAtSeatLimit ? "destructive" : "default"}>
              {company.seatUsed} / {company.seatLimit} usadas
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Utilizadores Ativos</div>
              <div className="font-medium">{activeUsersCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Disponíveis</div>
              <div className="font-medium">{company.seatAvailable}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Limite Atual</div>
              <div className="font-medium">{company.seatLimit}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seatLimit">Novo Limite de Contas</Label>
              <Input
                id="seatLimit"
                type="number"
                min={activeUsersCount}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Número de contas"
              />
              {!isValidLimit && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>O limite deve ser pelo menos {activeUsersCount} (utilizadores ativos atuais)</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={!isValidLimit || !hasChanges}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Clique em "Editar" para alterar o limite de contas
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              Editar Limite
            </Button>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como funciona</p>
              <ul className="space-y-1 text-sm">
                <li>• Apenas utilizadores <strong>ativos</strong> contam para o limite</li>
                <li>• Desativar um utilizador liberta imediatamente uma conta</li>
                <li>• O limite não pode ser inferior ao número de utilizadores ativos</li>
                <li>• Convites ficam bloqueados quando o limite é atingido</li>
              </ul>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            <span>Última atualização: {new Date(company.updatedAt).toLocaleString('pt-PT')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}