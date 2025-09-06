import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Paperclip, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  attachments: File[];
  preference: string;
}

interface FormErrors {
  [key: string]: string;
}

// Helper function placeholder
async function createSupportTicket(ticket: {
  source: 'chat' | 'form';
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  attachments?: Array<{ name: string; size: number }>;
  preference?: string;
  [key: string]: any;
}) {
  // Save to localStorage for demo
  const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
  const newTicket = {
    id: `AS-2025-${String(Date.now()).slice(-6)}`,
    ...ticket,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  tickets.push(newTicket);
  localStorage.setItem('support_tickets', JSON.stringify(tickets));
  
  console.log('Create ticket', newTicket);
  return { id: newTicket.id };
}

const subjectOptions = [
  { value: "agendamento", label: "Agendamento" },
  { value: "acesso", label: "Acesso/Conta" },
  { value: "financeiro", label: "Financeiro" },
  { value: "outros", label: "Outros" }
];

const preferenceOptions = [
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "qualquer", label: "Qualquer" }
];

export function SupportForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    attachments: [],
    preference: "email"
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.subject) {
      newErrors.subject = "Assunto é obrigatório";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Mensagem deve ter pelo menos 20 caracteres";
    }

    // Validate attachments
    const oversizedFiles = formData.attachments.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      newErrors.attachments = "Ficheiros não podem exceder 5 MB";
    }

    if (formData.attachments.length > 3) {
      newErrors.attachments = "Máximo de 3 ficheiros permitidos";
    }

    const invalidTypes = formData.attachments.filter(file => 
      !['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    );
    if (invalidTypes.length > 0) {
      newErrors.attachments = "Apenas ficheiros PDF, PNG e JPG são permitidos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, attachments: files }));
    // Clear attachment errors
    if (errors.attachments) {
      setErrors(prev => ({ ...prev, attachments: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const ticket = await createSupportTicket({
        source: 'form',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        attachments: formData.attachments.map(file => ({
          name: file.name,
          size: file.size
        })),
        preference: formData.preference
      });

      setTicketId(ticket.id);
      setIsSubmitted(true);

      toast({
        title: "Ticket criado com sucesso!",
        description: `Ticket #${ticket.id} criado. Tempo médio de resposta: 2–4h úteis.`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Erro ao criar ticket",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      attachments: [],
      preference: "email"
    });
    setErrors({});
    setIsSubmitted(false);
    setTicketId("");
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        <div>
          <h3 className="font-['Baskervville'] text-xl font-semibold mb-2">
            Ticket Criado com Sucesso!
          </h3>
          <p className="font-['Noto_Serif'] text-gray-600 mb-1">
            Ticket <span className="font-semibold">#{ticketId}</span> criado.
          </p>
          <p className="font-['Noto_Serif'] text-sm text-gray-500">
            Tempo médio de resposta: <span className="font-medium">2–4h úteis</span>
          </p>
        </div>
        <Button onClick={resetForm} variant="outline" className="font-['Noto_Serif']">
          Criar Novo Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="font-['Baskervville'] text-xl font-semibold mb-4">
        Falar com um Humano
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="font-['Noto_Serif']">
            Nome *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="O seu nome completo"
            className={`font-['Noto_Serif'] ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-['Noto_Serif']">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="o.seu.email@exemplo.com"
            className={`font-['Noto_Serif'] ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-['Noto_Serif']">
            Telefone (opcional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+258 XX XXX XXXX"
            className="font-['Noto_Serif']"
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="font-['Noto_Serif']">
            Assunto *
          </Label>
          <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
            <SelectTrigger className={`font-['Noto_Serif'] ${errors.subject ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione o assunto" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="font-['Noto_Serif']">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.subject}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message" className="font-['Noto_Serif']">
            Mensagem * (mínimo 20 caracteres)
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Descreva detalhadamente o seu problema ou questão..."
            rows={5}
            className={`font-['Noto_Serif'] ${errors.message ? 'border-red-500' : ''}`}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formData.message.length} caracteres</span>
            {errors.message && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.message}
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label htmlFor="attachments" className="font-['Noto_Serif']">
            Anexos (opcional - máx. 3 ficheiros, 5 MB cada, PDF/PNG/JPG)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="attachments"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="font-['Noto_Serif']"
            />
            <Paperclip className="h-4 w-4 text-gray-400" />
          </div>
          {formData.attachments.length > 0 && (
            <div className="text-sm text-gray-600">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex justify-between">
                  <span>{file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          )}
          {errors.attachments && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.attachments}
            </div>
          )}
        </div>

        {/* Contact Preference */}
        <div className="space-y-2">
          <Label className="font-['Noto_Serif']">Preferência de contacto</Label>
          <RadioGroup
            value={formData.preference}
            onValueChange={(value) => handleInputChange('preference', value)}
            className="flex gap-6"
          >
            {preferenceOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="font-['Noto_Serif'] cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-['Noto_Serif']"
        >
          {isLoading ? "A criar ticket..." : "Criar Ticket de Suporte"}
        </Button>
      </form>
    </div>
  );
}