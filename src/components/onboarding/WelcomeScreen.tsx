import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { userUIcopy } from "@/data/userUIcopy";

interface WelcomeScreenProps {
  companyName: string;
  onContinue: () => void;
}

export function WelcomeScreen({ companyName, onContinue }: WelcomeScreenProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl">{userUIcopy.onboarding.welcome}</CardTitle>
          <CardDescription className="text-base">
            Bem-vindo à {companyName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Estamos felizes por tê-lo connosco. Vamos configurar a sua conta
            e conhecer os benefícios disponíveis para si.
          </p>
          
          <Button onClick={onContinue} size="lg" className="w-full">
            Começar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
