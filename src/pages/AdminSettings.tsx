import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Shield, 
  Video, 
  Database, 
  Save, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";

interface PillarSettings {
  cancelWindow: number; // hours
  rescheduleWindow: number; // hours
  noShowDeduction: boolean;
}

interface PlatformSettings {
  slotGranularity: string; // "15" | "30" | "45" | "60"
  sessionBuffer: number; // minutes
  pillars: {
    mentalHealth: PillarSettings;
    physicalWellness: PillarSettings;
    financialAssistance: PillarSettings;
    legalAssistance: PillarSettings;
  };
  dataRetention: "6months" | "1year" | "2years" | "5years";
  flags: {
    encryptRecordings: boolean;
    notifyAdminOnPHI: boolean;
    requireJustification: boolean;
  };
}

const defaultSettings: PlatformSettings = {
  slotGranularity: "30",
  sessionBuffer: 5,
  pillars: {
    mentalHealth: { cancelWindow: 24, rescheduleWindow: 24, noShowDeduction: true },
    physicalWellness: { cancelWindow: 12, rescheduleWindow: 12, noShowDeduction: true },
    financialAssistance: { cancelWindow: 48, rescheduleWindow: 24, noShowDeduction: false },
    legalAssistance: { cancelWindow: 48, rescheduleWindow: 24, noShowDeduction: false }
  },
  dataRetention: "1year",
  flags: {
    encryptRecordings: true,
    notifyAdminOnPHI: true,
    requireJustification: true
  }
};

// Pillar names moved to common.json translations

const pillarColors = {
  mentalHealth: "from-blue-500 to-blue-600",
  physicalWellness: "from-green-500 to-green-600",
  financialAssistance: "from-yellow-500 to-yellow-600",
  legalAssistance: "from-purple-500 to-purple-600"
} as const;

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const updatePillarSettings = (pillar: keyof PlatformSettings['pillars'], pillarSettings: Partial<PillarSettings>) => {
    setSettings(prev => ({
      ...prev,
      pillars: {
        ...prev.pillars,
        [pillar]: { ...prev.pillars[pillar], ...pillarSettings }
      }
    }));
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center justify-between border-b border-border bg-white px-6">
          <div className="flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Configurações da Plataforma
                </h1>
                <p className="text-sm text-muted-foreground">
                  Defina as regras e políticas aplicadas globalmente às marcações e sessões
                </p>
            </div>
          </div>
          
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
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* Granularity & Buffers */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Granularidade & Buffers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tamanho do slot de marcação</Label>
                    <Select 
                      value={settings.slotGranularity} 
                      onValueChange={(value) => updateSettings({ slotGranularity: value })}
                    >
                      <SelectTrigger className="bg-white border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border z-50">
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Buffer entre sessões: {settings.sessionBuffer} minutos
                    </Label>
                    <Slider
                      value={[settings.sessionBuffer]}
                      onValueChange={([value]) => updateSettings({ sessionBuffer: value })}
                      max={30}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0 min</span>
                      <span>30 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pillar-specific Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(Object.keys(pillarNames) as Array<keyof typeof pillarNames>).map((pillarKey) => (
                <Card key={pillarKey} className="border-0 shadow-lg bg-white overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${pillarColors[pillarKey]} text-white`}>
                    <CardTitle className="text-lg">{pillarNames[pillarKey]}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Janela de cancelamento: {settings.pillars[pillarKey].cancelWindow}h
                      </Label>
                      <Slider
                        value={[settings.pillars[pillarKey].cancelWindow]}
                        onValueChange={([value]) => updatePillarSettings(pillarKey, { cancelWindow: value })}
                        max={72}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1h</span>
                        <span>72h</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Janela de reagendamento: {settings.pillars[pillarKey].rescheduleWindow}h
                      </Label>
                      <Slider
                        value={[settings.pillars[pillarKey].rescheduleWindow]}
                        onValueChange={([value]) => updatePillarSettings(pillarKey, { rescheduleWindow: value })}
                        max={72}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1h</span>
                        <span>72h</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Deduzir quota por falta</Label>
                      <Switch
                        checked={settings.pillars[pillarKey].noShowDeduction}
                        onCheckedChange={(value) => updatePillarSettings(pillarKey, { noShowDeduction: value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data Retention */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Retenção de dados</Label>
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
                  </div>

                  <div className="md:col-span-1">
                    <Label className="text-sm font-medium mb-3 block">Flags adicionais</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="encryptRecordings"
                          checked={settings.flags.encryptRecordings}
                          onCheckedChange={(checked) => updateFlags('encryptRecordings', checked as boolean)}
                        />
                        <Label htmlFor="encryptRecordings" className="text-sm">Encriptar gravações</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notifyAdminOnPHI"
                          checked={settings.flags.notifyAdminOnPHI}
                          onCheckedChange={(checked) => updateFlags('notifyAdminOnPHI', checked as boolean)}
                        />
                        <Label htmlFor="notifyAdminOnPHI" className="text-sm">Notificar admin em acessos PHI</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requireJustification"
                          checked={settings.flags.requireJustification}
                          onCheckedChange={(checked) => updateFlags('requireJustification', checked as boolean)}
                        />
                        <Label htmlFor="requireJustification" className="text-sm">Exigir justificação de visualização</Label>
                      </div>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;