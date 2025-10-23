import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { Building2, Users, UserCog, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};


const CARDS = [
  {
    id: 0,
    name: "Empresas",
    designation: "Gerir empresas e códigos",
    Icon: Building2,
    bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
    tabValue: "companies",
    content: (
      <p className="text-sm text-muted-foreground">
        Gestão completa de empresas cadastradas, geração de códigos de acesso únicos
        e monitoramento de utilizações em tempo real.
      </p>
    ),
  },
  {
    id: 1,
    name: "Colaboradores",
    designation: "Gerir utilizadores",
    Icon: Users,
    bgColor: "bg-gradient-to-br from-green-100 to-green-200",
    iconColor: "text-green-600",
    tabValue: "employees",
    content: (
      <p className="text-sm text-muted-foreground">
        Controle total sobre colaboradores, acompanhamento de sessões utilizadas
        e gestão de perfis de forma centralizada.
      </p>
    ),
  },
  {
    id: 2,
    name: "Prestadores",
    designation: "Gerir especialistas",
    Icon: UserCog,
    bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    iconColor: "text-yellow-600",
    tabValue: "providers",
    content: (
      <p className="text-sm text-muted-foreground">
        Administração de prestadores de serviços, atribuição de especialidades
        e controle de disponibilidade para agendamentos.
      </p>
    ),
  },
];


const activeCompanies = [
  {
    id: 1,
    name: "TechCorp Lda",
    employees: 45,
    sessions: { used: 287, total: 400 },
    status: "active",
    bgColor: "bg-blue-100"
  },
  {
    id: 2,
    name: "HealthPlus SA",
    employees: 120,
    sessions: { used: 823, total: 1000 },
    status: "active",
    bgColor: "bg-green-100"
  },
  {
    id: 3,
    name: "StartupHub",
    employees: 15,
    sessions: { used: 45, total: 150 },
    status: "onboarding",
    bgColor: "bg-yellow-100"
  },
  {
    id: 4,
    name: "ConsultPro",
    employees: 80,
    sessions: { used: 512, total: 600 },
    status: "active",
    bgColor: "bg-purple-100"
  }
];

const activeEmployees = [
  {
    id: 1,
    name: "João Silva",
    company: "TechCorp Lda",
    sessions: { used: 5, total: 10 },
    status: "active",
    bgColor: "bg-green-100"
  },
  {
    id: 2,
    name: "Maria Santos",
    company: "HealthPlus SA",
    sessions: { used: 3, total: 8 },
    status: "active",
    bgColor: "bg-blue-100"
  },
  {
    id: 3,
    name: "Pedro Costa",
    company: "StartupHub",
    sessions: { used: 2, total: 5 },
    status: "active",
    bgColor: "bg-purple-100"
  },
  {
    id: 4,
    name: "Ana Pereira",
    company: "ConsultPro",
    sessions: { used: 7, total: 12 },
    status: "active",
    bgColor: "bg-yellow-100"
  }
];

const activeProviders = [
  {
    id: 1,
    name: "Dr. Carlos Mendes",
    specialty: "Psicologia",
    sessions: { completed: 145, scheduled: 12 },
    status: "active",
    bgColor: "bg-blue-100"
  },
  {
    id: 2,
    name: "Dra. Sofia Rodrigues",
    specialty: "Nutrição",
    sessions: { completed: 98, scheduled: 8 },
    status: "active",
    bgColor: "bg-green-100"
  },
  {
    id: 3,
    name: "Dr. Miguel Ferreira",
    specialty: "Consultoria Financeira",
    sessions: { completed: 67, scheduled: 5 },
    status: "active",
    bgColor: "bg-yellow-100"
  },
  {
    id: 4,
    name: "Dra. Beatriz Alves",
    specialty: "Assistência Legal",
    sessions: { completed: 52, scheduled: 3 },
    status: "active",
    bgColor: "bg-purple-100"
  }
];

const platformTips = [
  {
    id: 1,
    tip: "Auditorias regulares de empresas inativas ajudam a manter métricas precisas",
    category: "Boa Prática"
  },
  {
    id: 2,
    tip: "Reveja a disponibilidade dos prestadores semanalmente para garantir capacidade ideal de agendamento",
    category: "Agendamento"
  },
  {
    id: 3,
    tip: "Monitorize padrões de uso de sessões para identificar empresas que necessitam de apoio",
    category: "Análise"
  },
  {
    id: 4,
    tip: "Configure alertas automáticos para empresas que se aproximam dos seus limites de sessões",
    category: "Automação"
  },
  {
    id: 5,
    tip: "Comunicação regular com contactos de RH melhora as taxas de adoção da plataforma",
    category: "Envolvimento"
  }
];

const integrations = [
  {
    name: "Saúde Mental",
    desc: "Sessões de psicologia e apoio emocional",
    icon: "🧠",
  },
  {
    name: "Bem-Estar Físico",
    desc: "Consultas de nutrição e fisioterapia",
    icon: "💪",
  },
  {
    name: "Apoio Financeiro",
    desc: "Consultoria financeira personalizada",
    icon: "💰",
  },
  {
    name: "Assistência Legal",
    desc: "Suporte jurídico especializado",
    icon: "⚖️",
  },
];

export default function RuixenSection({ 
  onAddCompany,
  onTabChange
}: { 
  onAddCompany?: () => void;
  onTabChange?: (tab: string) => void;
}) {
  const navigate = useNavigate();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % platformTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative gap-4">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 relative">
          {/* Card Stack with Navigation */}
          <div className="relative w-full mb-4 sm:mb-6">
            <CardStack 
              items={CARDS} 
              onTabChange={onTabChange}
              onCardChange={(index) => setActiveCardIndex(index)}
            />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Gestão Centralizada de Utilizadores{" "}
            <span className="text-primary">Wellness Platform</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              {" "}
              Controle completo sobre empresas, colaboradores e prestadores numa única
              plataforma integrada.
            </span>
          </h3>
        </div>


        {/* Right Block - Dynamic Content Based on Active Card */}
        <div className="flex flex-col border border-border p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {activeCardIndex === 0 && "Empresas Ativas"}
              {activeCardIndex === 1 && "Colaboradores Ativos"}
              {activeCardIndex === 2 && "Prestadores Ativos"}
            </h2>
            {activeCardIndex === 0 && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddCompany) {
                    onAddCompany();
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Empresa
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                    {activeCardIndex === 0 && "Empresa"}
                    {activeCardIndex === 1 && "Nome"}
                    {activeCardIndex === 2 && "Prestador"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                    {activeCardIndex === 0 && "Colaboradores"}
                    {activeCardIndex === 1 && "Empresa"}
                    {activeCardIndex === 2 && "Especialidade"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                    Sessões
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeCardIndex === 0 && activeCompanies.map((company) => (
                  <tr 
                    key={company.id} 
                    onClick={() => navigate(`/admin/companies/${company.id}`)}
                    className="group border-b border-border cursor-pointer transition-all relative"
                  >
                    <td colSpan={4} className="absolute inset-0 pointer-events-none">
                      <div className={cn(
                        "absolute inset-y-1 inset-x-4 rounded-full transition-all duration-300 group-hover:shadow-md",
                        company.bgColor
                      )} />
                    </td>
                    
                    <td className="py-4 px-4 text-foreground font-medium relative z-10">
                      {company.name}
                    </td>
                    <td className="py-4 px-4 relative z-10">
                      <div className="flex items-center gap-2 text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{company.employees}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground relative z-10">
                      {company.sessions.used}/{company.sessions.total}
                    </td>
                    <td className="py-4 px-4 relative z-10">
                      {company.status === "active" ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          Em Onboarding
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                
                {activeCardIndex === 1 && activeEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    onClick={() => navigate(`/admin/employees/${employee.id}`)}
                    className="group border-b border-border cursor-pointer transition-all relative"
                  >
                    <td colSpan={4} className="absolute inset-0 pointer-events-none">
                      <div className={cn(
                        "absolute inset-y-1 inset-x-4 rounded-full transition-all duration-300 group-hover:shadow-md",
                        employee.bgColor
                      )} />
                    </td>
                    
                    <td className="py-4 px-4 text-foreground font-medium relative z-10">
                      {employee.name}
                    </td>
                    <td className="py-4 px-4 text-foreground relative z-10">
                      {employee.company}
                    </td>
                    <td className="py-4 px-4 text-foreground relative z-10">
                      {employee.sessions.used}/{employee.sessions.total}
                    </td>
                    <td className="py-4 px-4 relative z-10">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        Ativo
                      </Badge>
                    </td>
                  </tr>
                ))}
                
                {activeCardIndex === 2 && activeProviders.map((provider) => (
                  <tr 
                    key={provider.id}
                    onClick={() => navigate(`/admin/providers/${provider.id}`)}
                    className="group border-b border-border cursor-pointer transition-all relative"
                  >
                    <td colSpan={4} className="absolute inset-0 pointer-events-none">
                      <div className={cn(
                        "absolute inset-y-1 inset-x-4 rounded-full transition-all duration-300 group-hover:shadow-md",
                        provider.bgColor
                      )} />
                    </td>
                    
                    <td className="py-4 px-4 text-foreground font-medium relative z-10">
                      {provider.name}
                    </td>
                    <td className="py-4 px-4 text-foreground relative z-10">
                      {provider.specialty}
                    </td>
                    <td className="py-4 px-4 text-foreground relative z-10">
                      {provider.sessions.completed} / {provider.sessions.scheduled} agendadas
                    </td>
                    <td className="py-4 px-4 relative z-10">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        Ativo
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats and Testimonial Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 w-full text-center sm:text-left">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">
                150+
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Empresas Ativas
              </p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">
                5,000+
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Colaboradores
              </p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">
                200+
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Prestadores
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="border-l-4 border-primary pl-4 sm:pl-6 lg:pl-8">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {platformTips[currentTipIndex].category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Dica {currentTipIndex + 1} de {platformTips.length}
                </span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-foreground font-medium">
                💡 {platformTips[currentTipIndex].tip}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
  Icon: any;
  bgColor: string;
  iconColor: string;
  tabValue: string;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
  onTabChange,
  onCardChange
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  onTabChange?: (tab: string) => void;
  onCardChange?: (index: number) => void;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  // Notify parent of card change
  useEffect(() => {
    const topCardIndex = items.findIndex(item => item.id === cards[0].id);
    onCardChange?.(topCardIndex);
  }, [cards, items, onCardChange]);

  const nextCard = () => {
    setCards((prevCards: Card[]) => {
      const newArray = [...prevCards];
      newArray.unshift(newArray.pop()!);
      return newArray;
    });
  };

  const prevCard = () => {
    setCards((prevCards: Card[]) => {
      const newArray = [...prevCards];
      newArray.push(newArray.shift()!);
      return newArray;
    });
  };


  return (
    <div className="relative mx-auto h-64 w-full md:h-64 md:w-96 my-4">
      {/* Navigation Arrows - Always visible */}
      <div className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-30">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            prevCard();
          }}
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background shadow-lg hover:bg-muted border-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-30">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            nextCard();
          }}
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background shadow-lg hover:bg-muted border-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {cards.map((card, index) => {
        const CardIcon = card.Icon;
        const isTopCard = index === 0;
        
        return (
          <motion.div
            key={card.id}
            onClick={() => {
              if (isTopCard && onTabChange) {
                // Change tab like BentoCards
                onTabChange(card.tabValue);
                
                // Scroll to content section
                setTimeout(() => {
                  const contentSection = document.querySelector('[data-tab-content]');
                  if (contentSection) {
                    contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }
            }}
            className={cn(
              "absolute h-64 w-full md:h-64 md:w-96 rounded-3xl p-6 shadow-xl border-2 flex flex-col justify-between transition-all",
              card.bgColor,
              isTopCard ? "cursor-pointer hover:shadow-2xl hover:scale-[1.02] border-primary/20" : "border-border"
            )}
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl bg-white/50", card.iconColor)}>
                <CardIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-semibold text-foreground mb-1">{card.name}</h4>
                <p className="text-sm text-muted-foreground font-medium">{card.designation}</p>
              </div>
            </div>
            <div className="mt-4">
              {card.content}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
