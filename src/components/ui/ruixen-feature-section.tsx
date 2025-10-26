import { cn } from "@/lib/utils"
import { CardContent, Card as UICard, CardHeader, CardTitle } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Star, Building, Video, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

type Session = {
  id: number | string;
  date: string;
  clientName: string;
  company: string;
  type: string;
  status: string;
  rating?: number;
};

interface RuixenSectionProps {
  stats?: {
    total: number;
    completed: number;
    scheduled: number;
    avgRating: number;
  };
  sessions?: Session[];
  getStatusBadge?: (status: string) => React.ReactNode;
}


export default function RuixenSection({ stats, sessions = [], getStatusBadge }: RuixenSectionProps) {
  // Sort sessions by date (most recent first) and take top 5
  const displaySessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
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

        {/* Right Block - Sessions List */}
        <div className="flex flex-col items-start justify-start border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">
            Sessões Recentes <span className="text-primary">Plataforma de Bem-Estar</span>{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Acompanhe as suas últimas sessões com colaboradores e empresas.
            </span>
          </h3>
          
          <div className="w-full overflow-y-auto max-h-[400px] pr-2 space-y-3 no-scrollbar">
            {displaySessions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma sessão encontrada
              </p>
            ) : (
              displaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all shadow-sm"
                >
                  {/* Row 1: Name, Type Badge, and Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <p className="text-lg font-semibold text-foreground truncate">
                        {session.clientName}
                      </p>
                      <Badge variant="outline" className="flex items-center gap-1.5 text-sm flex-shrink-0">
                        {session.type === 'Virtual' ? (
                          <Video className="h-3.5 w-3.5" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5" />
                        )}
                        {session.type}
                      </Badge>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge ? getStatusBadge(session.status) : (
                        <Badge variant="outline" className="text-sm">
                          {session.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Row 2: Company, Date, and Rating */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-base text-muted-foreground truncate">
                          {session.company}
                        </p>
                      </div>
                      <span className="text-base text-muted-foreground flex-shrink-0">
                        {new Date(session.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    {session.rating && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-base font-medium">{session.rating}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20">
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 w-full text-center sm:text-left max-w-3xl">
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
              <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                {card.icon}
                {card.title}
              </CardTitle>
            </CardHeader>
            <div>
              <div className="text-5xl font-bold text-foreground mb-2">
                {card.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
