import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Eye } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  event: string;
  subject: string;
  body: string;
  isActive: boolean;
  lastModified: string;
}

interface EmailPreviewProps {
  template: EmailTemplate;
  preview: { subject: string; body: string };
}

const EmailPreview = ({ template, preview }: EmailPreviewProps) => {
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const handleSendTest = () => {
    if (!testEmail) {
      toast({
        title: "Email necessário",
        description: "Introduza um email para enviar o teste.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Sending test email to:", testEmail);
    
    toast({
      title: "Teste enviado",
      description: `Email de teste enviado para ${testEmail}`,
    });
    
    setTestEmail("");
  };

  return (
    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pré-visualização: {template.name}
          </CardTitle>
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Assunto</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
              {preview.subject}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-600">Corpo da Mensagem</Label>
            <div className="mt-1 p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
              {preview.body}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="test-email">Enviar teste para</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <Button
              onClick={handleSendTest}
              className="bg-blue-600 hover:bg-blue-700 text-white mt-6"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Teste
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreview;