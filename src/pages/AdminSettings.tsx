import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Save, 
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface PlatformSettings {
  dataRetention: "6months" | "1year" | "2years" | "5years";
  flags: {
    encryptRecordings: boolean;
    notifyAdminOnPHI: boolean;
    requireJustification: boolean;
  };
}

const defaultSettings: PlatformSettings = {
  dataRetention: "1year",
  flags: {
    encryptRecordings: true,
    notifyAdminOnPHI: true,
    requireJustification: true
  }
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const updateFlags = (flag: keyof PlatformSettings['flags'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      flags: { ...prev.flags, [flag]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving settings:", settings);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Configurações guardadas",
      description: "Todas as alterações foram aplicadas com sucesso.",
      duration: 3000,
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Configurações repostas",
      description: "Todas as configurações foram repostas para os valores padrão.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Plataforma
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie políticas de retenção de dados e segurança da plataforma
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alterações não guardadas
          </Badge>
        )}
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Repor Padrões
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Guardar Configurações
        </Button>
      </div>

      {/* Data Retention Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <Database className="h-5 w-5" />
            Retenção de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Período de retenção de dados</Label>
              <Select 
                value={settings.dataRetention} 
                onValueChange={(value: any) => updateSettings({ dataRetention: value })}
              >
                <SelectTrigger className="bg-white border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border z-50">
                  <SelectItem value="6months">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      6 meses
                    </div>
                  </SelectItem>
                  <SelectItem value="1year">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      1 ano
                    </div>
                  </SelectItem>
                  <SelectItem value="2years">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      2 anos
                    </div>
                  </SelectItem>
                  <SelectItem value="5years">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      5 anos
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Define por quanto tempo os dados de sessões e utilizadores são mantidos
              </p>
            </div>

            <div className="md:col-span-1">
              <Label className="text-sm font-medium mb-3 block">Flags de segurança</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encryptRecordings"
                    checked={settings.flags.encryptRecordings}
                    onCheckedChange={(checked) => updateFlags('encryptRecordings', checked as boolean)}
                  />
                  <Label htmlFor="encryptRecordings" className="text-sm font-normal cursor-pointer">
                    Encriptar gravações de sessões
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyAdminOnPHI"
                    checked={settings.flags.notifyAdminOnPHI}
                    onCheckedChange={(checked) => updateFlags('notifyAdminOnPHI', checked as boolean)}
                  />
                  <Label htmlFor="notifyAdminOnPHI" className="text-sm font-normal cursor-pointer">
                    Notificar admin em acessos PHI
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireJustification"
                    checked={settings.flags.requireJustification}
                    onCheckedChange={(checked) => updateFlags('requireJustification', checked as boolean)}
                  />
                  <Label htmlFor="requireJustification" className="text-sm font-normal cursor-pointer">
                    Exigir justificação para visualização de dados
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;