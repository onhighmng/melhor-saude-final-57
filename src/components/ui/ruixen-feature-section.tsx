import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { Building2, Users, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
    content: (
      <p className="text-sm text-muted-foreground">
        Administração de prestadores de serviços, atribuição de especialidades
        e controle de disponibilidade para agendamentos.
      </p>
    ),
  },
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

export default function RuixenSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative gap-4">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 relative">
          {/* Card Stack with Navigation */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            <CardStack items={CARDS} />
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

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-border p-4 sm:p-6 lg:p-8">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed">
            Pilares de Bem-Estar Integrados{" "}
            <span className="text-primary">All-in-One</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              {" "}
              Acesse todos os serviços de bem-estar numa única plataforma centralizada,
              eliminando silos e facilitando a gestão.
            </span>
          </h3>
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-background px-4 sm:px-6 lg:px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              // before styles
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]"
            )}
          >
            {/* Integration List */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-background border border-border rounded-2xl sm:rounded-3xl z-10 w-full">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 sm:p-3 border border-border rounded-xl sm:rounded-2xl hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-full border border-border p-1.5 sm:p-2 text-xs font-semibold flex-shrink-0 ml-2">
                    <TbHeartPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
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
          <blockquote className="border-l-2 border-border pl-4 sm:pl-6 lg:pl-8 text-muted-foreground">
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
              A plataforma de wellness revolucionou a forma como gerimos o bem-estar dos
              nossos colaboradores. É a fusão perfeita de simplicidade e versatilidade,
              permitindo-nos criar experiências de saúde únicas.
            </p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <cite className="block font-medium text-sm sm:text-base text-foreground not-italic">
                Ricardo Pereira, CEO
              </cite>
              <div className="h-8 sm:h-10 flex items-center">
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  Wellness Corp
                </span>
              </div>
            </div>
          </blockquote>
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
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

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
      {/* Navigation Arrows */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          onClick={prevCard}
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background shadow-lg hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          onClick={nextCard}
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background shadow-lg hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {cards.map((card, index) => {
        const CardIcon = card.Icon;
        return (
          <motion.div
            key={card.id}
            className={cn(
              "absolute h-64 w-full md:h-64 md:w-96 rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between",
              card.bgColor
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
