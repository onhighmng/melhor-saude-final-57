import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { History, CalendarDays, Info } from "lucide-react";
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

type Card = {
  id: number;
  title: string;
  pillar: string;
  progress: number;
  sessions: string;
  emojis: string[];
};

interface Goal {
  id: string;
  title: string;
  pillar: string;
  targetSessions: number;
  completedSessions: number;
  progressPercentage: number;
  progressEmojis: string[];
}

interface UserBalance {
  userId: string;
  companyQuota: number;
  personalQuota: number;
  usedCompany: number;
  usedPersonal: number;
  availableCompany: number;
  availablePersonal: number;
}

interface UserJourneySectionProps {
  goals: Goal[];
  balance: UserBalance;
  completedSessionsCount: number;
  futureSessionsCount: number;
  onHistoryClick: () => void;
  onFutureSessionsClick: () => void;
}

export default function UserJourneySection({
  goals,
  balance,
  completedSessionsCount,
  futureSessionsCount,
  onHistoryClick,
  onFutureSessionsClick
}: UserJourneySectionProps) {
  
  const CARDS: Card[] = goals.map((goal, index) => ({
    id: index,
    title: goal.title,
    pillar: goal.pillar,
    progress: goal.progressPercentage,
    sessions: `${goal.completedSessions}/${goal.targetSessions} sessões completadas`,
    emojis: goal.progressEmojis
  }));

  const sessionStats = [
    {
      name: "Quota da Empresa",
      desc: `${balance.usedCompany}/${balance.companyQuota} usadas • Disponível: ${balance.availableCompany}`,
      icon: "🏢",
      progress: balance.companyQuota > 0 ? (balance.usedCompany / balance.companyQuota) * 100 : 0
    },
    {
      name: "Quota Pessoal",
      desc: `${balance.usedPersonal}/${balance.personalQuota} usadas • Disponível: ${balance.availablePersonal}`,
      icon: "👤",
      progress: balance.personalQuota > 0 ? (balance.usedPersonal / balance.personalQuota) * 100 : 0
    }
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative gap-4">
        {/* Left Block - Goals */}
        <div className="flex flex-col items-start justify-center border border-border rounded-2xl p-4 sm:p-6 lg:p-8 bg-card">
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-card to-transparent z-10"></div>
            <CardStack items={CARDS} />
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Acompanhe o Progresso dos seus{" "}
            <span className="text-primary">Objetivos de Bem-Estar</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Cada sessão concluída aproxima você dos seus objetivos de saúde e bem-estar.
            </span>
          </h3>
        </div>

        {/* Right Block - Session Quotas */}
        <div className="flex flex-col items-center justify-start border border-border rounded-2xl p-4 sm:p-6 lg:p-8 bg-card">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed w-full">
            Gestão das suas{" "}
            <span className="text-primary">Quotas de Sessões</span>{" "}
            <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Acompanhe o uso das suas quotas e gerencie as suas sessões.
            </span>
          </h3>
          
          <div className="w-full space-y-3 sm:space-y-4">
            {/* Quotas */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-background border border-border rounded-2xl sm:rounded-3xl w-full">
              {sessionStats.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start flex-col gap-2 p-3 border border-border rounded-xl hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    Cancelamentos, faltas e reagendamentos não consomem sessões da sua quota. 
                    Apenas sessões efetivamente concluídas são deduzidas.
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
      
      {/* Stats and Quick Actions Section */}
      <div className="mt-8 sm:mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* History Card */}
        <div 
          onClick={onHistoryClick}
          className="p-6 border border-border rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
              <History className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">Histórico de Sessões</h4>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{completedSessionsCount}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">sessões concluídas</p>
        </div>

        {/* Future Sessions Card */}
        <div 
          onClick={onFutureSessionsClick}
          className="p-6 border border-border rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">Próximas Sessões</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{futureSessionsCount}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">sessões agendadas</p>
        </div>

        {/* Quote Card */}
        <div className="p-6 border border-border rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center lg:col-span-1">
          <p className="text-center text-foreground italic text-sm leading-relaxed">
            Pequenos passos, grandes resultados. O seu bem-estar cresce com cada conquista 💙
          </p>
        </div>
      </div>
    </section>
  )
}

let interval: any;

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
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'saude_mental':
        return 'from-blue-500 to-blue-600';
      case 'assistencia_juridica':
        return 'from-purple-500 to-purple-600';
      case 'assistencia_financeira':
        return 'from-green-500 to-green-600';
      case 'bem_estar_fisico':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
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
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">{card.title}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{card.progress}% alcançado</span>
                  <div className="flex gap-1">
                    {card.emojis.slice(0, 5).map((emoji, i) => (
                      <span key={i} className="text-sm">{emoji}</span>
                    ))}
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full bg-gradient-to-r transition-all", getPillarColor(card.pillar))}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.sessions}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
