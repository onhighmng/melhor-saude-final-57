import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminUser, AdminPrestador } from '@/types/admin';
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from 'lucide-react';

interface UnifiedAccountFormProps {
  onSubmitUser: (userData: { name: string; email: string; company: string | null; companySessions: number; isActive: boolean }) => Promise<void>;
  onSubmitPrestador: (prestadorData: { 
    name: string; 
    email: string;
    password: string;
    pillar: string;
    specialty: string; 
    fullBio: string;
    experience: string;
    education: string[];
    specialties: string[];
    videoUrl: string;
    videoDescription: string;
    isActive: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

const UnifiedAccountForm = ({ onSubmitUser, onSubmitPrestador, onCancel }: UnifiedAccountFormProps) => {
  const { toast } = useToast();
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    company: '',
    companySessions: 5,
    password: '',
    confirmPassword: '',
    isActive: true
  });

  const [prestadorFormData, setPrestadorFormData] = useState({
    name: '',
    email: '',
    pillar: '',
    specialty: '',
    fullBio: '',
    experience: '',
    education: [''],
    specialties: [''],
    videoUrl: '',
    videoDescription: '',
    password: '',
    confirmPassword: '',
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('user');

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (userFormData.password !== userFormData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As palavras-passe não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (userFormData.password.length < 8) {
      toast({
        title: "Erro de validação", 
        description: "A palavra-passe deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process user data for submission
      const { password, confirmPassword, ...userData } = userFormData;
      await onSubmitUser(userData);
      setUserFormData({ name: '', email: '', company: '', companySessions: 5, password: '', confirmPassword: '', isActive: true });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrestadorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [
      { field: prestadorFormData.name, name: 'Nome' },
      { field: prestadorFormData.email, name: 'Email' },
      { field: prestadorFormData.password, name: 'Palavra-passe' },
      { field: prestadorFormData.pillar, name: 'Pilar' }
    ];

    for (const { field, name } of requiredFields) {
      if (!field || field.trim() === '') {
        toast({
          title: "Campo obrigatório em falta",
          description: `O campo "${name}" é obrigatório.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(prestadorFormData.email)) {
      toast({
        title: "Erro de validação",
        description: "Formato de email inválido.",
        variant: "destructive"
      });
      return;
    }

    // Password validation
    if (prestadorFormData.password !== prestadorFormData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As palavras-passe não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (prestadorFormData.password.length < 8) {
      toast({
        title: "Erro de validação",
        description: "A palavra-passe deve ter pelo menos 8 caracteres.", 
        variant: "destructive"
      });
      return;
    }

    // Validate pillar is one of expected values
    const validPillars = ['psicologica', 'financeira', 'juridica', 'fisica'];
    if (!validPillars.includes(prestadorFormData.pillar)) {
      toast({
        title: "Erro de validação",
        description: "Pilar inválido selecionado.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process prestador data for submission
      const { confirmPassword, ...prestadorData } = prestadorFormData;
      await onSubmitPrestador(prestadorData);
      
      // Show success message
      toast({
        title: "Prestador criado com sucesso",
        description: "A conta foi criada e um email de boas-vindas foi enviado.",
        variant: "default"
      });
      
      setPrestadorFormData({ 
        name: '', 
        email: '',
        pillar: '',
        specialty: '', 
        fullBio: '',
        experience: '',
        education: [''],
        specialties: [''],
        videoUrl: '',
        videoDescription: '',
        password: '', 
        confirmPassword: '', 
        isActive: true 
      });
    } catch (error: any) {
      console.error('Error creating prestador:', error);
      
      // Show specific error message
      let errorMessage = 'Erro ao criar prestador.';
      if (error?.message) {
        if (error.message.includes('already registered') || error.message.includes('email address is already in use')) {
          errorMessage = 'Este email já está registado no sistema.';
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Formato de email inválido.';
        } else if (error.message.includes('password')) {
          errorMessage = 'A palavra-passe não cumpre os requisitos.';
        } else if (error.message.includes('invalid pillar')) {
          errorMessage = 'Pilar inválido selecionado.';
        } else if (error.message.includes('Failed to create')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao criar prestador",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEducationField = () => {
    setPrestadorFormData({ 
      ...prestadorFormData, 
      education: [...prestadorFormData.education, ''] 
    });
  };

  const removeEducationField = (index: number) => {
    setPrestadorFormData({ 
      ...prestadorFormData, 
      education: prestadorFormData.education.filter((_, i) => i !== index) 
    });
  };

  const updateEducationField = (index: number, value: string) => {
    const newEducation = [...prestadorFormData.education];
    newEducation[index] = value;
    setPrestadorFormData({ ...prestadorFormData, education: newEducation });
  };

  const addSpecialtyField = () => {
    setPrestadorFormData({ 
      ...prestadorFormData, 
      specialties: [...prestadorFormData.specialties, ''] 
    });
  };

  const removeSpecialtyField = (index: number) => {
    setPrestadorFormData({ 
      ...prestadorFormData, 
      specialties: prestadorFormData.specialties.filter((_, i) => i !== index) 
    });
  };

  const updateSpecialtyField = (index: number, value: string) => {
    const newSpecialties = [...prestadorFormData.specialties];
    newSpecialties[index] = value;
    setPrestadorFormData({ ...prestadorFormData, specialties: newSpecialties });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Criar Nova Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user">Utilizador</TabsTrigger>
            <TabsTrigger value="prestador">Prestador</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-name">Nome Completo</Label>
                  <Input
                    id="user-name"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-company">Empresa</Label>
                  <Input
                    id="user-company"
                    value={userFormData.company}
                    onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                    placeholder="Nome da Empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user-sessions">Sessões Pagas pela Empresa</Label>
                  <Input
                    id="user-sessions"
                    type="number"
                    min="0"
                    value={userFormData.companySessions}
                    onChange={(e) => setUserFormData({ ...userFormData, companySessions: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Este colaborador terá direito a {userFormData.companySessions} sessões pagas pela empresa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-password">Palavra-passe</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="user-confirm-password">Confirmar Palavra-passe</Label>
                  <Input
                    id="user-confirm-password"
                    type="password"
                    value={userFormData.confirmPassword}
                    onChange={(e) => setUserFormData({ ...userFormData, confirmPassword: e.target.value })}
                    placeholder="Repetir palavra-passe"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'A Criar...' : 'Criar Utilizador'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="prestador">
            <form onSubmit={handlePrestadorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prestador-name">Nome Completo</Label>
                  <Input
                    id="prestador-name"
                    value={prestadorFormData.name}
                    onChange={(e) => setPrestadorFormData({ ...prestadorFormData, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prestador-email">Email</Label>
                  <Input
                    id="prestador-email"
                    type="email"
                    value={prestadorFormData.email}
                    onChange={(e) => setPrestadorFormData({ ...prestadorFormData, email: e.target.value })}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prestador-pillar">Pilar (Obrigatório)</Label>
                <Select
                  value={prestadorFormData.pillar}
                  onValueChange={(value) => setPrestadorFormData({ ...prestadorFormData, pillar: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pilar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psicologica">Saúde Psicológica</SelectItem>
                    <SelectItem value="financeira">Saúde Financeira</SelectItem>
                    <SelectItem value="fisica">Saúde Física</SelectItem>
                    <SelectItem value="juridica">Saúde Jurídica e Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prestador-specialty">Especialidade Principal</Label>
                <Input
                  id="prestador-specialty"
                  value={prestadorFormData.specialty}
                  onChange={(e) => setPrestadorFormData({ ...prestadorFormData, specialty: e.target.value })}
                  placeholder="Psicologia Clínica, Nutrição, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="prestador-bio">Biografia Completa</Label>
                <Textarea
                  id="prestador-bio"
                  value={prestadorFormData.fullBio}
                  onChange={(e) => setPrestadorFormData({ ...prestadorFormData, fullBio: e.target.value })}
                  placeholder="Descrição detalhada da experiência e abordagem profissional..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="prestador-experience">Experiência Profissional</Label>
                <Textarea
                  id="prestador-experience"
                  value={prestadorFormData.experience}
                  onChange={(e) => setPrestadorFormData({ ...prestadorFormData, experience: e.target.value })}
                  placeholder="Resumo da experiência profissional e anos de prática..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Formação Académica</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addEducationField}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {prestadorFormData.education.map((edu, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={edu}
                        onChange={(e) => updateEducationField(index, e.target.value)}
                        placeholder="Formação académica"
                      />
                      {prestadorFormData.education.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeEducationField(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Especialidades/Áreas de Foco</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSpecialtyField}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {prestadorFormData.specialties.map((specialty, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={specialty}
                        onChange={(e) => updateSpecialtyField(index, e.target.value)}
                        placeholder="Especialidade"
                      />
                      {prestadorFormData.specialties.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeSpecialtyField(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prestador-password">Palavra-passe</Label>
                  <Input
                    id="prestador-password"
                    type="password"
                    value={prestadorFormData.password}
                    onChange={(e) => setPrestadorFormData({ ...prestadorFormData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="prestador-confirm-password">Confirmar Palavra-passe</Label>
                  <Input
                    id="prestador-confirm-password"
                    type="password"
                    value={prestadorFormData.confirmPassword}
                    onChange={(e) => setPrestadorFormData({ ...prestadorFormData, confirmPassword: e.target.value })}
                    placeholder="Repetir palavra-passe"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'A Criar...' : 'Criar Prestador'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedAccountForm;