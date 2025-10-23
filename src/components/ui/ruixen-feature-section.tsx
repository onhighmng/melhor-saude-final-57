import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    designation: "HR Manager",
    content: (
      <p>
        A <Highlight>plataforma de wellness</Highlight> transformou completamente a gestão de bem-estar dos nossos colaboradores. A interface é{" "}
        <Highlight>intuitiva e eficiente</Highlight>, facilitando o acesso aos serviços.
      </p>
    ),
  },
  {
    id: 1,
    name: "João Santos",
    designation: "Administrador de Sistema",
    content: (
      <p>
        O <Highlight>sistema de gestão centralizada</Highlight> permite controlar empresas, colaboradores e prestadores de forma integrada. As métricas em tempo real{" "}
        <Highlight>facilitam a tomada de decisões</Highlight> estratégicas.
      </p>
    ),
  },
  {
    id: 2,
    name: "Ana Costa",
    designation: "Diretora de RH",
    content: (
      <p>
        Após implementar a plataforma, a <Highlight>taxa de utilização</Highlight> dos serviços aumentou 60%. A geração de códigos de acesso e{" "}
        <Highlight>gestão de sessões</Highlight> tornou-se simples e segura.
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
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10"></div>
            <CardStack items={CARDS} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Experiência de Gestão Intuitiva{" "}
            <span className="text-primary">Wellness Platform</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              {" "}
              Simplifique a gestão de bem-estar com dashboards intuitivos que fornecem
              insights acionáveis em tempo real.
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
            <div className="font-normal text-muted-foreground">{card.content}</div>
            <div>
              <p className="text-foreground font-medium">{card.name}</p>
              <p className="text-muted-foreground font-normal">{card.designation}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
