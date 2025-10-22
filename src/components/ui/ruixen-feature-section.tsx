import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Heart, DollarSign, Scale } from "lucide-react";

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
    name: "Maria Silva",
    designation: "Gestora de RH",
    content: (
      <p>
        A <Highlight>plataforma de bem-estar</Highlight> transformou completamente a forma como gerimos os benefícios dos colaboradores. A interface é{" "}
        <Highlight>intuitiva e eficiente</Highlight>, permitindo análises detalhadas.
      </p>
    ),
  },
  {
    id: 1,
    name: "João Santos",
    designation: "Diretor de Recursos Humanos",
    content: (
      <p>
        Com esta <Highlight>solução integrada</Highlight>, conseguimos aumentar o engagement dos colaboradores em 60%. A visualização de{" "}
        <Highlight>dados em tempo real</Highlight> facilita decisões estratégicas.
      </p>
    ),
  },
  {
    id: 2,
    name: "Ana Costa",
    designation: "Coordenadora de Benefícios",
    content: (
      <p>
        O sistema de <Highlight>análise por pilar</Highlight> permite-nos monitorizar a utilização dos serviços de forma clara. A{" "}
        <Highlight>equipa de suporte</Highlight> é excecional e sempre disponível.
      </p>
    ),
  },
];

const integrations = [
  {
    name: "Saúde Mental",
    desc: "Sessões de psicologia e apoio emocional personalizado",
    icon: <Brain className="w-4 h-4 text-blue-600" />,
  },
  {
    name: "Bem-Estar Físico",
    desc: "Programas de fitness e nutrição adaptados",
    icon: <Heart className="w-4 h-4 text-yellow-600" />,
  },
  {
    name: "Assistência Financeira",
    desc: "Consultoria financeira e planeamento patrimonial",
    icon: <DollarSign className="w-4 h-4 text-green-600" />,
  },
  {
    name: "Assistência Jurídica",
    desc: "Apoio legal e consultoria jurídica especializada",
    icon: <Scale className="w-4 h-4 text-purple-600" />,
  },
];

export default function RuixenSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-l-xl">
          {/* Card */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            <CardStack items={CARDS} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Experiência Intuitiva de Dashboard <span className="text-primary">Plataforma Wellness</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg"> Simplifique a gestão de bem-estar com componentes elegantes que fornecem insights acionáveis imediatamente.</span>
          </h3>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-border p-4 sm:p-6 lg:p-8 bg-card rounded-r-xl">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed">
            Ecossistema Integrado de Pilares <span className="text-primary">Wellness</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg"> Acesso completo a todos os pilares de bem-estar numa única plataforma centralizada e eficiente.</span>
          </h3>
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-background px-4 sm:px-6 lg:px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
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
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-border p-1.5 sm:p-2 text-xs font-semibold flex-shrink-0 ml-2 hover:bg-muted transition"><TbHeartPlus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
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
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">+850</div>
              <p className="text-sm sm:text-base text-muted-foreground">Empresas Parceiras</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">120K</div>
              <p className="text-sm sm:text-base text-muted-foreground">Colaboradores Ativos</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">95%</div>
              <p className="text-sm sm:text-base text-muted-foreground">Taxa Satisfação</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote className="border-l-2 border-border pl-4 sm:pl-6 lg:pl-8 text-muted-foreground">
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">Usar esta plataforma foi como desbloquear um novo nível de produtividade na gestão de bem-estar. É a fusão perfeita entre simplicidade e versatilidade, permitindo criar experiências incríveis para os colaboradores.</p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <cite className="block font-medium text-sm sm:text-base text-foreground">Pedro Almeida, CEO</cite>
              <div className="text-xs text-muted-foreground">Tech Solutions Portugal</div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
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

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-card h-48 w-full md:h-48 md:w-96 rounded-3xl p-4 shadow-xl border border-border flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
          >
            <div className="font-normal text-muted-foreground">
              {card.content}
            </div>
            <div>
              <p className="text-foreground font-medium">
                {card.name}
              </p>
              <p className="text-muted-foreground font-normal text-sm">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
