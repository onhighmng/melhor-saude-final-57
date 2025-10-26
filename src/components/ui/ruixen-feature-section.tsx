import { cn } from "@/lib/utils"
import { CardContent, Card as UICard, CardHeader, CardTitle } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Star } from "lucide-react";

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

type StatsCard = {
  id: number;
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
};

interface RuixenSectionProps {
  stats?: {
    total: number;
    completed: number;
    scheduled: number;
    avgRating: number;
  };
}

const integrations = [
  {
    name: "Gestão de Horários",
    desc: "Organize a sua disponibilidade e sessões em tempo real",
    icon: "📅",
  },
  {
    name: "Videochamadas",
    desc: "Realize sessões virtuais com qualidade profissional",
    icon: "🎥",
  },
  {
    name: "Notas de Sessão",
    desc: "Documente e acompanhe o progresso dos colaboradores",
    icon: "📝",
  },
  {
    name: "Avaliações",
    desc: "Receba feedback e melhore continuamente o seu serviço",
    icon: "⭐",
  },
];

export default function RuixenSection({ stats }: RuixenSectionProps) {
  const statsCards: StatsCard[] = stats ? [
    {
      id: 0,
      title: "Total de Sessões",
      value: stats.total,
      description: "Todas as sessões",
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
    },
    {
      id: 1,
      title: "Concluídas",
      value: stats.completed,
      description: `${Math.round((stats.completed / stats.total) * 100)}% do total`,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      gradient: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
    },
    {
      id: 2,
      title: "Agendadas",
      value: stats.scheduled,
      description: "Próximas sessões",
      icon: <Clock className="h-4 w-4 text-amber-600" />,
      gradient: "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
    },
    {
      id: 3,
      title: "Avaliação Média",
      value: `${stats.avgRating.toFixed(1)}/10`,
      description: "Satisfação dos colaboradores",
      icon: <Star className="h-4 w-4 text-purple-600" />,
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
    }
  ] : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-blue-50 dark:from-gray-900 to-transparent z-10"></div>
            <StatsCardStack items={statsCards} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white leading-relaxed">
            Experiência Profissional Intuitiva com <span className="text-primary">Plataforma de Bem-Estar</span>{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Simplifique a gestão das suas sessões com ferramentas profissionais que fornecem insights e controlo total.
            </span>
          </h3>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">
            Ecossistema de Ferramentas Integradas <span className="text-primary">Plataforma de Bem-Estar</span>{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Integre-se perfeitamente com todas as funcionalidades essenciais para prestar o melhor serviço.
            </span>
          </h3>
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
            )}
          >
            {/* Integration List */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl z-10 w-full">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-gray-200 dark:border-gray-700 p-1.5 sm:p-2 text-xs font-semibold flex-shrink-0 ml-2">
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
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">+150</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Prestadores Ativos</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">5K+</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Sessões Realizadas</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">4.9</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Avaliação Média</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 sm:pl-6 lg:pl-8 text-gray-700 dark:text-gray-400">
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
              Usar esta plataforma foi como desbloquear um novo nível de produtividade. É a fusão perfeita de simplicidade e versatilidade, permitindo-nos criar experiências de bem-estar excepcionais.
            </p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <cite className="block font-medium text-sm sm:text-base text-gray-900 dark:text-white">Dr. Ricardo Mendes, Diretor Clínico</cite>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

let interval: any;

export const StatsCardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: StatsCard[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<StatsCard[]>(items);

  useEffect(() => {
    if (items.length > 0) {
      setCards(items);
      startFlipping();
    }

    return () => clearInterval(interval);
  }, [items]);
  
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: StatsCard[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 3000);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className={cn(
              "absolute h-48 w-full md:h-48 md:w-96 rounded-3xl p-6 shadow-xl border-0 flex flex-col justify-between",
              `bg-gradient-to-br ${card.gradient}`
            )}
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
          >
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {card.icon}
                {card.title}
              </CardTitle>
            </CardHeader>
            <div>
              <div className="text-4xl font-bold text-foreground mb-1">
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
