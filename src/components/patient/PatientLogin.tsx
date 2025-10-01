
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PatientLoginProps {
  onLogin: (userData: any) => void;
}

const PatientLogin = ({ onLogin }: PatientLoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Direct registration without verification
      const userData = {
        id: Date.now(),
        name: formData.name,
        phone: formData.phone
      };
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${formData.name}! Pode começar a usar a plataforma imediatamente.`
      });
      
      onLogin(userData);
    } else {
      // Direct login without verification
      const userData = {
        id: 1,
        name: formData.name || "Utilizador",
        phone: formData.phone || "123456789"
      };
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta! Acesso imediato à sua conta.`
      });
      
      onLogin(userData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border border-accent-sage/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy-blue mb-4">
            A Minha Saúde
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={!isRegistering ? "default" : "outline"}
              onClick={() => setIsRegistering(false)}
              className="flex-1 transition-all duration-300"
            >
              Iniciar Sessão
            </Button>
            <Button
              variant={isRegistering ? "default" : "outline"}
              onClick={() => setIsRegistering(true)}
              className="flex-1 transition-all duration-300"
            >
              Criar Conta
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="bg-white/50 border-accent-sage/20"
                placeholder="Digite o seu nome"
              />
            </div>
            
            {isRegistering && (
              <div>
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/50 border-accent-sage/20"
                  placeholder="Digite o seu telefone"
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-sky to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sky text-white transition-all duration-300"
            >
              {isRegistering ? 'Criar Conta' : 'Iniciar Sessão'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientLogin;
